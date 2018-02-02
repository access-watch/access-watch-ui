import { Observable } from 'rxjs';
import {
  routeChange$,
  addressesRoute$,
  addressDetailsRoute$,
} from '../../src/router';
import { robotsMetrics$ } from './obs_robots_metrics';
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

const allAddressesRoute$ = Observable.merge(
  addressesRoute$,
  addressDetailsRoute$
);

const obsAddresses = Observable.combineLatest(
  addressSessions$,
  allAddressesRoute$.switchMap(_ => robotsMetrics$.takeUntil(routeChange$))
).map(
  ([
    { sessions: addresses, sessionDetails, route, routeDetails, activity },
    robotsMetrics,
  ]) => ({
    route,
    routeDetails,
    addresses,
    addressDetails: sessionDetails && {
      address: sessionDetails.session,
      logs: sessionDetails.logs,
      rule: sessionDetails.rule,
    },
    robotsMetrics,
    activity,
  })
);

export default obsAddresses;
