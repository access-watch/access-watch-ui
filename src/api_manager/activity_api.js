import { Observable } from 'rxjs';
import { extractTimerange } from './utils';
import { pickKeys } from '../utilities/object';
import { getMetricsObs, mergeTimeSerieMetrics } from './metrics_agent_api';

import { routeChange$, metricsRoute$ } from '../router';

import { dataEvents, D_ACTIVITY } from '../event_hub';

import config from '../app_config';

const METRICS_RETENTION = config.metrics.expiration;

// The possible amount of time by which activity data will be grouped
const possibleSteps = [
  1,
  2,
  5,
  10,
  30,
  60,
  2 * 60,
  5 * 60,
  10 * 60,
  30 * 60,
  1 * 3600,
  2 * 3600,
  5 * 3600,
  10 * 3600,
  1 * 24 * 3600,
];

const findPossibleStep = (hours, ticks) => {
  const tmpStep = Math.round(hours * 3600 / ticks);
  return possibleSteps.find((p, i, pDur) => {
    if (i === pDur.length - 1) {
      return true;
    }
    const nextDiff = tmpStep - pDur[i + 1];
    return Math.abs(tmpStep - p) < Math.abs(nextDiff) && nextDiff < 0;
  });
};

let serverDataStartTimeObserver;

const serverDataStartTime$ = Observable.create(obs => {
  serverDataStartTimeObserver = obs;
}).share();

const routeWithTimerange$ = routeChange$
  .map(extractTimerange)
  .filter(({ end, start }) => end && start)
  .publishReplay(1);

/**
 * @fires api_manager#QueryParams
 */
const activityDetailsPollStart$ = Observable.merge(metricsRoute$)
  .map(extractTimerange)
  .filter(({ end, start }) => end && start)
  .map(({ end, start, ticks }) => ({
    end,
    start,
    step: findPossibleStep((end - start) / 3600000, ticks),
  }))
  .share();

const activityPollStart$ = Observable.merge(metricsRoute$, routeWithTimerange$)
  .combineLatest(serverDataStartTime$.startWith(undefined))
  .map(([{ timeSlider, ticks }, serverDataStartTime]) => {
    let start = serverDataStartTime;
    // If no auto, we want the full timespan
    if (timeSlider !== 'auto') {
      start = new Date().getTime() - timeSlider * 60000;
    } else if (!start) {
      start = new Date().getTime() - METRICS_RETENTION * 1000;
    }
    return {
      start,
      step: findPossibleStep((new Date().getTime() - start) / 3600000, ticks),
    };
  })
  .share();

const getActivityObs = params => {
  const timeFilter = pickKeys(['start', 'end', 'step'])(params);
  const metric = 'request';
  return Observable.zip(
    getMetricsObs({ metric, timeFilter, by: 'type' }),
    getMetricsObs({ metric, timeFilter, by: 'status', tags: { type: 'robot' } })
  ).map(([type, status]) => ({
    activity: mergeTimeSerieMetrics([status, type]),
    query: params,
  }));
};

const activityResFactory = (obs, takeUntil) =>
  obs
    .flatMap(params =>
      getActivityObs(params).takeUntil(Observable.merge(...takeUntil))
    )
    .share();

let startSlidingIntervalTimeout;

const startSlidingInterval = ({ step, start, ticks, obs }) => {
  if (startSlidingIntervalTimeout) {
    window.clearTimeout(startSlidingIntervalTimeout);
    startSlidingIntervalTimeout = null;
  }
  const nextStep = possibleSteps[possibleSteps.indexOf(step) + 1];
  const nextTimeInterval = nextStep * ticks * 1000;
  const startDelta = new Date().getTime() - new Date(start).getTime();
  const nextQuerying = nextTimeInterval - startDelta;
  if (startDelta >= METRICS_RETENTION * 1000) {
    obs.next(null);
    startSlidingIntervalTimeout = null;
    return;
  }
  startSlidingIntervalTimeout = window.setTimeout(_ => {
    obs.next(start);
    startSlidingInterval({
      step: nextStep,
      start,
      ticks,
      obs,
    });
  }, nextQuerying);
};

const getFullActivity = ({ query, activity }) => {
  const { step } = query;
  const start = query.start - query.start % (step * 1000);
  const end = query.end - query.end % (step * 1000);
  const firstActivityDelta = Math.floor((activity[0][0] - start) / 1000);
  const lastActivityDelta = Math.floor(
    (end - activity[activity.length - 1][0]) / 1000
  );
  let newActivity = [...activity];
  if (firstActivityDelta > step) {
    const missingActivity = new Array(Math.floor(firstActivityDelta / step))
      .fill(0)
      .map((_, i) => [new Date(start).getTime() + i * step * 1000, {}]);
    newActivity = missingActivity.concat(newActivity);
  }
  if (lastActivityDelta > step) {
    const missingActivity = new Array(Math.floor(lastActivityDelta / step))
      .fill(0)
      .map((_, i, arr) => [
        new Date(end).getTime() - (arr.length - i) * step * 1000,
        {},
      ]);
    newActivity = newActivity.concat(missingActivity);
  }
  return newActivity;
};

export const activityRes$ = activityResFactory(activityPollStart$, [
  routeChange$,
  serverDataStartTime$,
])
  .withLatestFrom(Observable.merge(metricsRoute$, routeWithTimerange$))
  .filter(([{ activity, query }, { timeSlider, ticks, timerangeFrom }]) => {
    // We don't modify at all the query with a timerange
    if (timerangeFrom) {
      return true;
    }
    if (activity.length) {
      const { start, step } = query;
      const firstActivityTime = activity[0][0];
      const timeDelta = Math.abs(new Date(start).getTime() - firstActivityTime);
      // If firstActivityTime/start parameter delta is different more than the step asked for
      if (timeDelta > step * 1000 && timeSlider === 'auto') {
        serverDataStartTimeObserver.next(firstActivityTime);
        startSlidingInterval({
          step: findPossibleStep(
            (new Date().getTime() - firstActivityTime) / 3600000,
            ticks
          ),
          start: firstActivityTime,
          ticks,
          obs: serverDataStartTimeObserver,
        });
        return false;
      }
      if (timeSlider !== 'auto') {
        if (startSlidingIntervalTimeout) {
          window.clearTimeout(startSlidingIntervalTimeout);
          startSlidingIntervalTimeout = null;
        }
      }
    }
    return true;
  })
  .map(([realRes, { timeSlider }]) => {
    // If slider is not on auto, we want the full timeline with 0 activity
    if (timeSlider !== 'auto') {
      return {
        ...realRes,
        activity: getFullActivity(realRes),
      };
    }
    return realRes;
  });

export const activityDetailRes$ = activityResFactory(
  activityDetailsPollStart$,
  [routeChange$]
).map(res => ({
  ...res,
  activity: getFullActivity(res),
}));

export const loading$ = (obs, obsRes) =>
  obs
    .switchMap(
      _ =>
        obsRes
          .take(1)
          .mapTo(false)
          .startWith(true) // initially set to true
    )
    .publishReplay(1)
    .refCount();

// A little trick to find if activity is loading
export const activityDetailLoading$ = loading$(
  activityDetailsPollStart$,
  activityDetailRes$
);
export const activityLoading$ = loading$(activityPollStart$, activityRes$);

Observable.merge(activityRes$, activityDetailRes$).subscribe(
  ({ activity, query }) => {
    dataEvents.emit(D_ACTIVITY, { activity, query });
  }
);

routeWithTimerange$.connect();
