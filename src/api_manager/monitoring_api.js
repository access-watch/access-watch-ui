import { poll, api } from './api';

import { routeChange$, statusRoute$ } from '../router';

import { dataEvents, D_MONITORING } from '../event_hub';

import { getAvgSpeedAndCount } from './utils';

const transformSpeeds = ({ accepted, rejected, ...rest }) => ({
  ...rest,
  accepted: getAvgSpeedAndCount({ speed: accepted }),
  rejected: getAvgSpeedAndCount({ speed: rejected }),
});

/**
 * @fires api_manager#QueryParams
 */

const monitoringPollStart$ = statusRoute$;

export const monitoringRes$ = monitoringPollStart$
  .flatMap(_ =>
    poll(
      () => api.get('/monitoring').then(arr => arr.map(transformSpeeds)),
      2000
    ).takeUntil(routeChange$)
  )
  .share();

// A little trick to find if monitoring are loading
export const monitoringLoading$ = monitoringPollStart$
  .flatMap(
    _ =>
      monitoringRes$
        .take(1)
        .mapTo(false)
        .startWith(true) // initially set to true
  )
  .publishReplay(1)
  .refCount();

monitoringRes$.subscribe(result => {
  dataEvents.emit(D_MONITORING, [...result]);
});
