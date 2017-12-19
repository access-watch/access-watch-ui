import { Observable } from 'rxjs';

import { getMetricsSummaryObs } from '../api_manager/metrics_agent_api';
import { metricsRoute$ } from '../../src/router';
import { extractTimerange } from '../api_manager/utils';
import { pickKeys } from '../utilities/object';

const computeFilterType = type => {
  if (type === 'all') {
    return undefined;
  }
  if (type === 'humans') {
    return 'browser';
  }
  return 'robot';
};

const transformFilters = origFilters => {
  const { worldMapFilters, ...otherFilters } = origFilters;
  const filters = {
    type: computeFilterType(worldMapFilters),
    ...otherFilters,
  };
  if (filters.after) {
    delete filters.hours;
  }
  if (filters.type === 'robot' && worldMapFilters !== 'robots') {
    filters.status = worldMapFilters;
  }
  return filters;
};

const getCountriesObs = params =>
  getMetricsSummaryObs({
    metric: 'request',
    timeFilter: {
      start: new Date().getTime() - 24 * 3600 * 1000,
      ...pickKeys(['start', 'end'])(params),
    },
    by: 'country',
    tags:
      params.type || params.status
        ? pickKeys(['type', 'status'])(params)
        : null,
  });

const worldMapFilter$ = metricsRoute$
  .map(extractTimerange)
  .map(transformFilters);

const countryMetrics$ = worldMapFilter$
  .switchMap(filters => getCountriesObs(filters))
  .startWith({})
  .share();

const countryMetricsLoading$ = worldMapFilter$
  .mapTo('Filter changed')
  .merge(countryMetrics$)
  .map(d => d === 'Filter changed');

export default Observable.combineLatest(
  countryMetrics$,
  countryMetricsLoading$
).map(([metrics, loading]) => ({
  metrics,
  loading,
}));
