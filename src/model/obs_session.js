import { Observable } from 'rxjs';
import omit from 'blacklist';
import {
  getSessionsObs,
  getSessionDetailsObs,
} from '../api_manager/api_agent_sessions';
import { routeChange$ } from '../../src/router';
import createLogs from './create_logs';
import { getSearchesObs } from '../api_manager/searches_api';
import searches$ from '../store/obs_searches_store';
import { getIn, pickKeys } from '../utilities/object';
import { globalActivity$ } from './obs_activity';
import {
  viewEvents,
  V_SESSIONS_LOAD_MORE,
  dataEvents,
  D_ADD_RULE_SUCCESS,
  D_DELETE_RULE_SUCCESS,
} from '../event_hub';
import { matchCondition } from '../api_manager/rules_agent_api';

const MORE_SESSIONS_LIMIT = 50;

const onLoadMoreSessions$ = Observable.fromEvent(
  viewEvents,
  V_SESSIONS_LOAD_MORE
);

const sessionsLengthRoundToLimit = (
  { sessions },
  limit = MORE_SESSIONS_LIMIT
) => Math.floor((sessions.length + (limit - 1)) / limit) * limit;

const createParametersObs = ({ route$, lastSessions }) =>
  route$.switchMap(p =>
    Observable.of(p)
      .combineLatest(
        onLoadMoreSessions$
          .map(
            _ => sessionsLengthRoundToLimit(lastSessions) + MORE_SESSIONS_LIMIT
          )
          .startWith(Math.max(sessionsLengthRoundToLimit(lastSessions), 50))
      )
      .map(([routeParams, limit]) => ({
        ...routeParams,
        limit,
      }))
      .takeUntil(routeChange$)
  );

const getSessionDetailsRuleReducer = ({ type, session }) => {
  const isMatchingSessionDetails = matchCondition(type)(session);
  const matchingObservable = eventType =>
    Observable.fromEvent(dataEvents, eventType)
      .map(({ rule }) => rule)
      .filter(isMatchingSessionDetails);
  return Observable.merge(
    matchingObservable(D_ADD_RULE_SUCCESS).map(rule => s => ({
      ...s,
      rule,
    })),
    matchingObservable(D_DELETE_RULE_SUCCESS).map(_ => s => omit(s, 'rule'))
  );
};

export const createSessionDetailsObs = ({
  routeId,
  logMapping,
  sessionDetails$,
  lastSessions = { sessions: [] },
  type,
}) => p =>
  Observable.of(p)
    .map(r => lastSessions.sessions.find(({ id }) => id === r[routeId]))
    .switchMap(sessionOrig =>
      Observable.merge(
        sessionDetails$,
        getSessionDetailsObs({ ...p, type, id: p[routeId] })
      )
        .take(1)
        .startWith(sessionOrig)
        // In case this is a direct access, lastSessions might have returned undefined
        .filter(session => session)
        .switchMap(session =>
          Observable.merge(
            Observable.of(session),
            getSessionDetailsObs({ ...p, type, id: p[routeId] })
          )
            .switchMap(s =>
              Observable.of(s)
                .merge(getSessionDetailsRuleReducer({ type, session: s }))
                .scan((state, reducer) => reducer(state))
            )
            .combineLatest(
              createLogs({
                filter: `${logMapping}:${getIn(
                  session,
                  logMapping.split('.')
                )}`,
                ...pickKeys(['timerangeFrom', 'timerangeTo'])(p),
              })
            )
        )
        .map(([session, logs]) => ({ session, logs }))
    );

const timerangeChanged = ({ timerangeFrom, timerangeTo }, { timerange }) =>
  !!(timerangeFrom && timerangeTo) === timerange;

const createGlobalSessions$ = ({ parameters$, allSessions$, lastSessions }) =>
  parameters$
    .switchMap(p =>
      allSessions$(p)
        .map(sessions => ({
          sessions: {
            sessions,
            loading: false,
            end: sessions.length < p.limit,
          },
        }))
        .startWith({
          sessions: {
            sessions: timerangeChanged(p, lastSessions)
              ? lastSessions.sessions
              : [],
            loading:
              !timerangeChanged(p, lastSessions) ||
              lastSessions.sessions.length < p.limit,
          },
        })
        .takeUntil(routeChange$)
    )
    .startWith({
      sessions: {
        sessions: [],
        loading: true,
      },
    });

export const createSessions$ = ({
  route$,
  routeDetails$,
  createFilter,
  type,
  routeId,
  logMapping,
}) => {
  const lastSessions = {
    sessions: [],
  };

  let sessionDetailsObserver;

  const sessionDetails$ = Observable.create(obs => {
    sessionDetailsObserver = obs;
  });

  const allRoute$ = Observable.merge(route$, routeDetails$);

  const parameters$ = createParametersObs({ route$: allRoute$, lastSessions });

  const rulesReducer$ = Observable.merge(
    Observable.fromEvent(dataEvents, D_ADD_RULE_SUCCESS).map(
      ({ rule }) => sessions =>
        sessions.map(session => ({
          ...session,
          ...(matchCondition(type)(session)(rule) ? { rule } : {}),
        }))
    ),
    Observable.fromEvent(dataEvents, D_DELETE_RULE_SUCCESS).map(
      ({ rule }) => sessions =>
        sessions.map(session => ({
          ...session,
          ...(session.rule && session.rule.id === rule.id
            ? { rule: null }
            : {}),
        }))
    )
  );

  const allSessions$ = ({
    sort,
    limit,
    visType,
    timerangeFrom,
    timerangeTo,
    filter,
    timeSlider,
    ...rest
  }) =>
    getSessionsObs({
      type,
      // Treemap only support sort by count
      ...(visType === 'treemap' ? { sort: 'count' } : { sort }),
      limit,
      timerangeFrom,
      timerangeTo,
      timeSlider,
      ...createFilter(rest),
      filter,
    }).switchMap(s =>
      Observable.of(s)
        .merge(rulesReducer$)
        .scan((state, reducer) => reducer(state))
        .do(sessions => {
          lastSessions.timerange = !!(timerangeFrom && timerangeTo);
          lastSessions.sessions = [...sessions];
        })
        .do(sessions => {
          const sessionId = rest[routeId];
          if (sessionId) {
            const sessionDetails = sessions.find(({ id }) => id === sessionId);
            if (sessionDetails) {
              sessionDetailsObserver.next(sessionDetails);
            }
          }
        })
    );

  const globalSessions$ = createGlobalSessions$({
    parameters$,
    allSessions$,
    lastSessions,
  });
  const detailsSessions$ = createSessionDetailsObs({
    routeId,
    logMapping,
    lastSessions,
    sessionDetails$,
    type,
  });

  return Observable.combineLatest(
    globalSessions$,
    Observable.merge(
      route$.mapTo(false),
      routeDetails$
        .filter(r => r[routeId])
        // Replacing the '_' we used in sessions.jsx for it's real value ':'
        .map(r => ({
          ...r,
          [routeId]: r[routeId].replace(/_/g, ':'),
        }))
        .switchMap(p => detailsSessions$(p).takeUntil(routeChange$))
    ),
    allRoute$.switchMap(_ =>
      globalActivity$
        .combineLatest(
          searches$.map(({ searches, actionPending }) => ({
            searches: searches[type],
            actionPending,
          })),
          getSearchesObs()
        )
        .takeUntil(routeChange$)
    )
  )
    .withLatestFrom(route$.startWith(null), routeDetails$.startWith(null))
    .map(
      ([
        [{ sessions }, sessionDetails, [activity, searches]],
        route,
        routeDetails,
      ]) => ({
        route,
        routeDetails,
        sessions,
        sessionDetails,
        activity,
        searches,
      })
    );
};

searches$.connect();
