import { Observable } from '../rx';
import { globalActivity$, detailActivity$ } from './obs_activity';
import metrics$ from '../store/obs_metrics_store';
import { metricsLoading$ } from '../api_manager';
import { routeChange$, metricsRoute$ } from '../../src/router';
import worldmap$ from './obs_worldmap';

// placeholder values for status chart
export const STATUS_INITIAL = [
  {
    name: 'bad',
    label: 'Bad',
    percentage: 0,
  },
  {
    name: 'suspicious',
    label: 'Suspicious',
    percentage: 0,
  },
  {
    name: 'ok',
    label: 'Ok',
    percentage: 0,
  },
  {
    name: 'nice',
    label: 'Nice',
    percentage: 0,
  },
];

// placeholder values for type chart
export const TYPE_INITIAL = [
  {
    name: 'humans',
    label: 'Humans',
    percentage: 0,
  },
  {
    name: 'robots',
    label: 'Robots',
    percentage: 0,
    path: '',
  },
  {
    name: 'unknown',
    label: 'Unknown',
    percentage: 0,
    path: '',
  },
];

const delta = last => curr => {
  const dt = Math.max(0, curr - last);
  // eslint-disable-next-line
  last = curr;
  return dt;
};

/**
 * Emits on every frame with delta time since last emit
 */
const tick = Observable.defer(_ =>
  Observable.create(observer => {
    let requestId;
    const callback = currentTime => {
      // If we have not been disposed, then request the next frame
      if (requestId) {
        requestId = window.requestAnimationFrame(callback);
      }
      observer.next(currentTime);
    };

    requestId = window.requestAnimationFrame(callback);

    return () => {
      if (requestId) {
        window.cancelAnimationFrame(requestId);
        requestId = undefined;
      }
    };
  }).map(delta(performance.now()))
);

const charts = {
  // metrics.type object from the api
  type: {
    robot: {
      label: 'Robots', // to show in the markup
      name: 'robots', // to use as css class modifier
    },
    browser: {
      label: 'Humans',
      name: 'humans',
    },
    unknown: {
      label: 'Unknown',
      name: 'unknown',
    },
  },
  // metrics.status object from the api
  status: {
    nice: {
      label: 'Nice',
    },
    ok: {
      label: 'Ok',
    },
    suspicious: {
      label: 'Suspicious',
    },
    bad: {
      label: 'Bad',
    },
  },
};

const calcRouteTime = ({ hours, timerangeFrom, timerangeTo }) =>
  timerangeFrom ? (timerangeTo - timerangeFrom) / 60000 : hours * 60;

const requestsMetrics$ = metrics$
  .withLatestFrom(metricsRoute$)
  .map(([{ requests }, routeParams]) => ({
    requests,
    mins: calcRouteTime(routeParams),
  }))
  .map(({ requests, mins }) => ({
    ...requests,
    avgSpeed: requests.count ? requests.count / mins : 0,
  }));

const TRANS_TIME = 1000;

// source: https://github.com/chenglou/tween-functions/blob/master/index.js
// t: current time, c: final value, d: total duration
// eslint-disable-next-line
const easeInCubic = (t, c, d) => c * (t /= d) * t * t;

const animatedChart = chartName => {
  if (!charts[chartName]) {
    throw new Error('Non-existant chart', chartName);
  }

  const ticker = tick
    .scan((t, dt) => t + dt, 0)
    .takeUntil(Observable.timer(TRANS_TIME))
    .concat(Observable.of(TRANS_TIME))
    .share();

  const c$ = metrics$
    .map(m => m[chartName])
    .filter(values => values && Object.keys(values).length)
    .map(values =>
      Object.keys(values).map(v => ({
        name: v,
        ...charts[chartName][v],
        percentage: values[v].percentage / 100,
      }))
    );

  // animate first time
  return Observable.merge(
    c$.take(1).flatMap(values =>
      ticker.map(t =>
        values.map(value => ({
          ...value,
          percentage: easeInCubic(
            Math.min(t, TRANS_TIME),
            value.percentage,
            TRANS_TIME
          ),
        }))
      )
    ),
    c$.skip(1)
  );
};

const statusMetrics$ = animatedChart('status').publishBehavior(STATUS_INITIAL);

const typeMetrics$ = animatedChart('type').publishBehavior(TYPE_INITIAL);

const circleCharts$ = Observable.zip(typeMetrics$, statusMetrics$);

export default metricsRoute$
  .startWith({})
  .bufferCount(2, 1)
  .flatMap(([prevRouteParams, routeParams]) =>
    Observable.combineLatest(
      metricsLoading$,
      requestsMetrics$,
      circleCharts$,
      worldmap$,
      globalActivity$,
      Observable.of(routeParams).flatMap(
        p =>
          p && p.timerangeFrom
            ? Observable.of(prevRouteParams).flatMap(
                prev =>
                  prev && prev.timerangeFrom
                    ? detailActivity$
                    : Observable.merge(
                        globalActivity$.take(1),
                        detailActivity$.filter(({ loading }) => !loading)
                      )
              )
            : globalActivity$
      )
    )
      .map(
        ([
          metricsLoading,
          requests,
          [type, status],
          worldmap,
          activity,
          graphActivity,
        ]) => ({
          metricsLoading,
          type,
          requests,
          status,
          worldmap,
          activity,
          graphActivity,
        })
      )
      .takeUntil(routeChange$)
  );

metricsLoading$.subscribe();
metrics$.connect();
typeMetrics$.connect();
statusMetrics$.connect();
