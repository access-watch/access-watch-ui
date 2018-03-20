import { Observable } from 'rxjs';
import { extractTimerange } from './utils';
import { pickKeys } from '../utilities/object';
import { getMetricsObs, mergeTimeSerieMetrics } from './metrics_agent_api';
import { possibleSteps, findPossibleStep } from '../utilities/time';

import { routeChange$, metricsRoute$, sessionsRoute$ } from '../router';

import { dataEvents, D_ACTIVITY } from '../event_hub';

import { getExpiration } from '../utilities/config';

const METRICS_RETENTION = getExpiration('metrics');

let serverDataStartTimeObserver;

export const serverDataStartTime$ = Observable.create(obs => {
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
    step: findPossibleStep(end - start, ticks),
  }))
  .share();

const activityPollRoutes$ = Observable.merge(
  metricsRoute$,
  routeWithTimerange$,
  sessionsRoute$
);

const initialStartTime =
  (Math.floor(new Date().getTime() / 1000) - getExpiration('metrics')) * 1000;

// also polling activity anyway for sessionsRoute as they need the serverDataStartTime
const activityPollStart$ = activityPollRoutes$
  .combineLatest(
    serverDataStartTime$.startWith(initialStartTime).distinctUntilChanged()
  )
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
      step: findPossibleStep(new Date().getTime() - start, ticks),
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
  .withLatestFrom(activityPollRoutes$)
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
            new Date().getTime() - firstActivityTime,
            ticks
          ),
          start: firstActivityTime,
          ticks,
          obs: serverDataStartTimeObserver,
        });
        return false;
      }
      if (timeSlider === 'auto') {
        serverDataStartTimeObserver.next(firstActivityTime);
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
