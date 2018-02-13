import { Observable } from 'rxjs';
import {
  getSessionsObs,
  getSessionDetailsObs,
} from '../api_manager/api_agent_sessions';
import { routeChange$ } from '../../src/router';
import createLogs from './create_logs';
import { getRulesObs, matchCondition } from '../api_manager/rules_agent_api';
import rules$ from '../store/obs_rules_store';
import { getIn } from '../utilities/object';
import { globalActivity$ } from './obs_activity';

export const createSessionDetailsObs = ({
  routeId,
  logMapping,
  sessionDetails$,
  lastSessions,
  type,
}) => p =>
  Observable.of(p)
    .map(r => lastSessions.sessions.find(({ id }) => id === r[routeId]))
    .switchMap(sessionOrig =>
      Observable.merge(
        sessionDetails$,
        getSessionDetailsObs({ type, id: p[routeId] })
      )
        .take(1)
        .startWith(sessionOrig)
        // In case this is a direct access, lastSessions might have returned undefined
        .filter(session => session)
        .switchMap(session =>
          Observable.merge(
            Observable.of(session),
            getSessionDetailsObs({ type, id: p[routeId] })
          ).combineLatest(
            createLogs({
              filter: {
                [logMapping]: [getIn(session, logMapping.split('.'))],
              },
              filterEnabled: true,
            }),
            rules$.map(({ rules, actionPending }) => ({
              ...Object.values(rules).find(matchCondition(type)(session)),
              actionPending,
            })),
            // We explicitly need to say we want to poll rules while here
            getRulesObs()
          )
        )
        .map(([session, logs, rule]) => ({ session, logs, rule }))
    );

const timerangeChanged = ({ timerangeFrom, timerangeTo }, { timerange }) =>
  !!(timerangeFrom && timerangeTo) === timerange;

const createGlobalSessions$ = ({ route$, allSessions$, lastSessions }) =>
  route$.switchMap(p =>
    allSessions$(p)
      .map(sessions => ({
        sessions: {
          sessions,
          loading: false,
        },
      }))
      .startWith({
        sessions: {
          sessions: timerangeChanged(p, lastSessions)
            ? lastSessions.sessions
            : [],
          loading: !timerangeChanged(p, lastSessions),
        },
      })
      .takeUntil(routeChange$)
  );

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

  const allSessions$ = ({
    sort,
    limit,
    visType,
    timerangeFrom,
    timerangeTo,
    filter,
    ...rest
  }) =>
    getSessionsObs({
      type,
      // Treemap only support sort by count
      ...(visType === 'treemap' ? { sort: 'count' } : { sort }),
      limit,
      timerangeFrom,
      timerangeTo,
      ...createFilter(rest),
      filter,
    })
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
      });

  const globalSessions$ = createGlobalSessions$({
    route$,
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

  const allRoute$ = Observable.merge(route$, routeDetails$);

  return Observable.combineLatest(
    globalSessions$,
    Observable.merge(
      route$.mapTo(false),
      routeDetails$
        .filter(r => r[routeId])
        // Replacing the '_' we used in sessions.jsx for it's real value ':'
        .map(r => ({
          [routeId]: r[routeId].replace(/_/g, ':'),
        }))
        .switchMap(p => detailsSessions$(p).takeUntil(routeChange$))
    ),
    allRoute$.switchMap(_ => globalActivity$.takeUntil(routeChange$))
  )
    .withLatestFrom(route$.startWith({}), routeDetails$.startWith({}))
    .map(([[{ sessions }, sessionDetails, activity], route, routeDetails]) => ({
      route,
      routeDetails,
      sessions,
      sessionDetails,
      activity,
    }));
};

rules$.connect();
