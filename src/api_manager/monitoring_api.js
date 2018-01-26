import { poll, api } from './api';

import { routeChange$, statusRoute$ } from '../router';

import { dataEvents, D_MONITORING } from '../event_hub';

import { getAvgSpeedAndCount } from './utils';

const transformSpeeds = ({ speeds, ...rest }) => ({
  ...rest,
  speeds: Object.keys(speeds).reduce(
    (acc, key) => ({
      ...acc,
      [key]: getAvgSpeedAndCount({ speed: speeds[key] }),
    }),
    {}
  ),
});

/**
 * @fires api_manager#QueryParams
 */

const monitoringPollStart$ = statusRoute$;

export const monitoringRes$ = monitoringPollStart$
  .flatMap(_ =>
    poll(
      () =>
        api
          .get('/monitoring')
          .then(arr => arr.map(transformSpeeds))
          .then(arr => {
            console.log(arr);
            return arr;
          }),
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
