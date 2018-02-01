import { Observable } from 'rxjs';
import { addressesRoute$, addressDetailsRoute$ } from '../../src/router';
import { createSessions$ } from './obs_session';

const createFilter = ({ reputation }) => ({
  ...(reputation ? { filter: `address.reputation.status:${reputation}` } : {}),
});

const addressSessions$ = createSessions$({
  route$: addressesRoute$,
  routeDetails$: addressDetailsRoute$,
  createFilter,
  type: 'address',
  routeId: 'address',
  logMapping: 'address.value',
});

const obsAddresses = Observable.combineLatest(addressSessions$).map(
  ([{ sessions: addresses, sessionDetails, route, routeDetails }]) => ({
    route,
    routeDetails,
    addresses,
    addressDetails: sessionDetails && {
      address: sessionDetails.session,
      logs: sessionDetails.logs,
      rule: sessionDetails.rule,
    },
  })
);

export default obsAddresses;
