import { Observable } from 'rxjs';
import { pickKeys } from '../utilities/object';

import { routeChange$, metricsRoute$, requestsRoute$ } from '../router';

import { dataEvents, D_METRICS } from '../event_hub';
import { getExpiration } from '../utilities/config';

import { getMetricsSummaryObs, getMetricsSpeed } from './metrics_agent_api';

const metricsObs = params => {
  const timeSlider =
    params.timeSlider === 'auto' ? getExpiration('metrics') : params.timeSlider;
  const timeFilter = pickKeys(['start', 'end'])(params);
  const metric = 'request';
  const speedParams = {
    metric,
    by: 'type',
    ...(params.end ? { timeFilter } : {}),
  };
  const timeParams = {
    ...(Object.keys(timeFilter).length > 0 ? { timeFilter } : {}),
    timeDelta: timeSlider * 60,
  };
  return Observable.zip(
    getMetricsSummaryObs({ metric, ...timeParams, by: 'type' }),
    getMetricsSummaryObs({
      metric,
      ...timeParams,
      by: 'status',
      tags: { type: 'robot' },
    }),
    getMetricsSpeed(speedParams)
  ).map(([type, status, speed]) => {
    const requestsCount = Object.keys(type).reduce(
      (sum, k) => sum + type[k].count,
      0
    );
    return {
      requests: {
        count: requestsCount,
        speed: speed.total * 60,
      },
      type,
      status,
    };
  });
};

/**
 * @fires api_manager#QueryParams
 */
const metricsPollStart$ = Observable.merge(metricsRoute$, requestsRoute$).map(
  ({ timeSlider, timerangeFrom, timerangeTo }) => ({
    timeSlider,
    ...(timerangeFrom && { start: timerangeFrom }),
    ...(timerangeTo && { end: timerangeTo }),
  })
);

export const metricsRes$ = metricsPollStart$
  .flatMap(params =>
    metricsObs(params)
      .map(metrics => ({
        metrics,
        query: params,
      }))
      .takeUntil(routeChange$)
  )
  .share();

// A little trick to find if metrics are loading
export const metricsLoading$ = metricsPollStart$
  .flatMap(
    _ =>
      metricsRes$
        .take(1)
        .mapTo(false)
        .startWith(true) // initially set to true
  )
  .publishReplay(1)
  .refCount();

metricsRes$.subscribe(result => {
  dataEvents.emit(D_METRICS, { ...result });
});
