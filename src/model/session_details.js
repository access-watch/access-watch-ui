import { Observable } from 'rxjs';
import { createSessionDetailsObs } from './obs_session';
import createLogs from './create_logs';
import { getSessionDetails } from '../api_manager/api_agent_sessions';
import { type, logMapping as robotLogMapping } from './obs_robots';
import { filterToURI } from '../utilities/filter';

const identityLogMapping = 'identity.id';

export const getLogMapping = ({ robot }) =>
  robot ? robotLogMapping : identityLogMapping;

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
          sessionDetails$: Observable.of(s),
          type,
          logMapping: robotLogMapping,
        })({ session: id });
      }
      return createLogs({
        filter: filterToURI({ id: identityLogMapping, values: [id] }),
      }).map(logs => ({
        logs,
        session: { id, type: 'identity' },
      }));
    })
  );
