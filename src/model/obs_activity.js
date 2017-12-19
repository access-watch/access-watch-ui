import { Observable } from '../rx';

import activity$ from '../store/obs_activity_store';
import { activityLoading$, activityDetailLoading$ } from '../api_manager';

const activityKeys = ['browser', 'nice', 'ok', 'suspicious', 'bad'];

const emptyFormattedActivity = activityKeys.reduce(
  (statusAcc, statusKey) => ({
    ...statusAcc,
    [statusKey]: [],
  }),
  {}
);

export const ACTIVITY_INITIAL = emptyFormattedActivity;

const formatActivity = ({ activity }) =>
  activity.reduce(
    (formatedActAcc, v) =>
      activityKeys.reduce(
        (statusAcc, statusKey) => ({
          ...statusAcc,
          [statusKey]: [...statusAcc[statusKey], [v[0], v[1][statusKey] || 0]],
        }),
        formatedActAcc
      ),
    emptyFormattedActivity
  );

const withLoading = (obs, loadingObs) =>
  Observable.combineLatest(obs, loadingObs).map(([activity, loading]) => ({
    activity,
    loading,
  }));

export const detailActivity$ = withLoading(
  activity$
    .filter(({ detail }) => detail)
    .map(({ detail }) => detail)
    .map(formatActivity),
  activityDetailLoading$
);

export const globalActivity$ = withLoading(
  activity$
    .filter(({ global }) => global)
    .map(({ global }) => global)
    .map(formatActivity),
  activityLoading$.startWith(false)
);

activity$.connect();
activityLoading$.subscribe();
activityDetailLoading$.subscribe();
