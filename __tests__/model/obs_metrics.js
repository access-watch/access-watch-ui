jest.enableAutomock();

const TARGET = '../../src/model/obs_metrics';

jest.unmock(TARGET);
jest.unmock('../../src/i18n');

const { Observable } = require('rxjs/Rx');

describe('metrics', () => {
  let Router, APIManager, MetricsStore;

  beforeEach(() => {
    Router = require('../../src/router');

    APIManager = require('../../src/api_manager');
    APIManager.metricsLoading$ = Observable.of(true);
    APIManager.activityLoading$ = Observable.of(true);
    APIManager.metricsRes$ = Observable.of({ query: {} });

    MetricsStore = require('../../src/store/obs_metrics_store');
    MetricsStore.default = Observable.interval(2000)
      .mapTo(MetricsStore.INITIAL)
      .publishBehavior(MetricsStore.INITIAL);
  });

  it('triggers on routechange with loading state', () => {
    Router.metricsRoute$ = Observable.of(
      Router.METRICS_DEFAULT_PARAMS
    ).publishBehavior(Router.METRICS_DEFAULT_PARAMS);

    const p = new Promise(resolve => {
      require(TARGET).default.subscribe(resolve);
    }).then(d => {
      const { STATUS_INITIAL, TYPE_INITIAL } = require(TARGET);
      const { ACTIVITY_INITIAL } = require('../../src/model/obs_activity');
      expect(d).toEqual({
        metricsLoading: true,
        type: TYPE_INITIAL,
        activity: ACTIVITY_INITIAL,
        graphActivity: ACTIVITY_INITIAL,
        requests: { total: 0, speed: 0, avgSpeed: 0 },
        status: STATUS_INITIAL,
        worldmap: {},
      });
    });
    return p;
  });

  it('completes on subsequent route change', () => {
    Router.metricsRoute$ = Observable.of(Router.METRICS_DEFAULT_PARAMS);
    Router.routeChange$ = Observable.interval(500).mapTo('change'); // *
    const t = require(TARGET);
    const { STATUS_INITIAL, TYPE_INITIAL } = t;
    const { ACTIVITY_INITIAL } = require('../../src/model/obs_activity');
    const p = Promise.all([
      new Promise(resolve => {
        t.default.subscribe(resolve);
      }),
      new Promise(resolve => {
        t.default.subscribe({
          complete() {
            resolve();
          },
        });
      }),
    ]).then(([d]) => {
      expect(d).toEqual({
        metricsLoading: true,
        activity: ACTIVITY_INITIAL,
        graphActivity: ACTIVITY_INITIAL,
        type: TYPE_INITIAL,
        requests: { total: 0, speed: 0, avgSpeed: 0 },
        status: STATUS_INITIAL,
        worldmap: {},
      });
    });

    // run timers to trigger onRouteChange mocked above *
    jest.runOnlyPendingTimers();
    return p;
  });
});
