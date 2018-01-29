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

export const createSessionDetailsObs = ({
  routeId,
  logMapping,
  sessionDetails$,
  lastSessions,
  type,
}) => p =>
  Observable.of(p)
    .map(r => lastSessions.find(({ id }) => id === r[routeId]))
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
              filters: {
                [logMapping]: [getIn(session, logMapping.split('.'))],
              },
              filtersEnabled: true,
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

const createGlobalSessions$ = ({ route$, allSessions$ }) =>
  route$.switchMap(p =>
    allSessions$(p)
      .map(sessions => ({
        sessions: {
          sessions,
          loading: false,
        },
      }))
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
  let lastSessions = [];

  let sessionDetailsObserver;

  const sessionDetails$ = Observable.create(obs => {
    sessionDetailsObserver = obs;
  });

  const allSessions$ = ({ sort, limit, visType, ...rest }) =>
    getSessionsObs({
      type,
      // Treemap only support sort by count
      ...(visType === 'treemap' ? { sort: 'count' } : { sort }),
      limit,
      ...createFilter(rest),
    })
      .do(sessions => {
        lastSessions = [...sessions];
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
  }).startWith({
    sessions: {
      sessions: lastSessions,
      loading: true,
    },
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
          [routeId]: r[routeId].replace(/_/g, ':'),
        }))
        .switchMap(p => detailsSessions$(p).takeUntil(routeChange$))
    )
  )
    .withLatestFrom(route$.startWith({}), routeDetails$.startWith({}))
    .map(([[{ sessions }, sessionDetails], route, routeDetails]) => ({
      route,
      routeDetails,
      sessions,
      sessionDetails,
    }));
};

rules$.connect();
