import metrics$ from '../store/obs_metrics_store';

export const INITIAL = {
  status: {},
  total: 0,
};

export const robotsMetrics$ = metrics$
  .map(metrics => ({
    status: metrics.status,
    total: metrics.type && metrics.type.robot ? metrics.type.robot.count : 0,
  }))
  .startWith(INITIAL);

metrics$.connect();
