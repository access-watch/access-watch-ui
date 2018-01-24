import { Observable } from 'rxjs';
import { createSessionDetailsObs } from './obs_session';
import createLogs from './create_logs';
import { getSessionDetails } from '../api_manager/api_agent_sessions';
import { type, logMapping } from './obs_robots';

const createSessionLogs = id =>
  createLogs({}).map(({ logs, ...rest }) => ({
    ...rest,
    logs: logs.filter(({ session }) => session.id === id),
  }));

export default ({ session: id }) =>
  Observable.of(id).switchMap(_ =>
    Observable.fromPromise(
      getSessionDetails({ type, id }).catch(err => {
        if (err.status && err.status === 404) {
          return null;
        }
        throw err;
      })
    ).switchMap(s => {
      if (s) {
        return createSessionDetailsObs({
          routeId: 'session',
          logMapping,
          sessionDetails$: Observable.of(s),
          lastSessions: [],
          type,
        })({ session: id });
      }
      return createSessionLogs(id).map(logs => ({ logs, session: {} }));
    })
  );
