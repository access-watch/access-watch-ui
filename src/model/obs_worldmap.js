import { Observable } from 'rxjs';

import { getMetricsSummaryObs } from '../api_manager/metrics_agent_api';
import { metricsRoute$ } from '../../src/router';
import { extractTimerange } from '../api_manager/utils';
import { getExpiration } from '../utilities/config';

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

const getCountriesObs = ({ start, end, type, status, timeSlider }) =>
  getMetricsSummaryObs({
    metric: 'request',
    timeDelta:
      (timeSlider === 'auto' ? getExpiration('metrics') : timeSlider) * 60,
    ...(start || end ? { timeFilter: { start, end } } : {}),
    by: 'country',
    tags: type || status ? { type, status } : null,
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
