import { Router } from 'director';
import { parse, stringify } from 'qs';
import { Observable } from './rx';
import RouterStateStore from './store/router_state_store';

// actions from user interaction
import { viewEvents, V_SET_ROUTE, V_UPDATE_ROUTE_PARAMS } from './event_hub';

/**
 * @event Router#RouteChange
 * @type {object}
 * @property {string} name Route identifier id
 * @property {stirng} [id] Optional view details id atm only session_id
 */

// Route ids of the availible routes. Every matched URL has its own unique one
export const ROUTE_ROOT = 'root';
export const ROUTE_METRICS = 'metrics';
export const ROUTE_ROBOTS = 'robots';
export const ROUTE_ROBOTS_DETAILS = 'robots_details';
export const ROUTE_REQUESTS = 'requests';
export const ROUTE_REQUESTS_DETAILS = 'requests_details';
export const ROUTE_STATUS = 'status';
export const ROUTE_ADDRESSES = 'addresses';
export const ROUTE_ADDRESSES_DETAILS = 'addresses_details';
export const ROUTE_RULES = 'rules';

const ROUTE_STATE_LOCAL_STORAGE_ID = 'aw-route-state';

const timerangeProps = {
  timerangeFrom: 'g',
  timerangeTo: 'g',
  timeSlider: 'g',
};

const DEFAULT_TIMERANGE_PROPS = {
  ticks: 150,
  timeSlider: 'auto',
};

const timeProps = {
  ...timerangeProps,
};

const DEFAULT_TIME_PROPS = {
  ...DEFAULT_TIMERANGE_PROPS,
};

const sessionProps = {
  sort: 'p',
  visType: 'p',
  ...timerangeProps,
};

const DEFAULT_SESSION_PROPS = {
  sort: 'speed',
  visType: 'treemap',
  ...DEFAULT_TIMERANGE_PROPS,
};

const routerStateStoreConfig = {
  [ROUTE_METRICS]: {
    ...timeProps,
    worldMapFilters: 'p',
  },
  [ROUTE_ROBOTS]: {
    ...sessionProps,
    ...timeProps,
    reputation: 'p',
  },
  [ROUTE_ROBOTS_DETAILS]: {
    ...timeProps,
    reputation: 'p',
  },
  [ROUTE_REQUESTS]: {
    ...timeProps,
    filters: 'p',
    filtersEnabled: 'p',
  },
  [ROUTE_REQUESTS_DETAILS]: {
    ...timeProps,
  },
  [ROUTE_ADDRESSES]: {
    ...sessionProps,
    reputation: 'p',
  },
  [ROUTE_ADDRESSES_DETAILS]: {
    ...timeProps,
  },
};
const routerStateStore = new RouterStateStore(
  ROUTE_STATE_LOCAL_STORAGE_ID,
  routerStateStoreConfig
);

// default query params to use if none was specified
// these are overridden by params in window.location
export const ROBOTS_DEFAULT_PARAMS = {
  ...DEFAULT_TIME_PROPS,
  ...DEFAULT_SESSION_PROPS,
};

export const SESSION_DETAILS_DEFAULT_PARAMS = {
  ...DEFAULT_TIME_PROPS,
};

export const REQUESTS_DEFAULT_PARAMS = {
  filtersEnabled: true,
  ...DEFAULT_TIME_PROPS,
};

export const METRICS_DEFAULT_PARAMS = {
  worldMapFilters: 'all',
  ...DEFAULT_TIME_PROPS,
};

export const ADDRESSES_DEFAULT_PARAMS = {
  ...DEFAULT_SESSION_PROPS,
  visType: 'table',
  filters: [],
};

const valueConverters = {
  number: param => {
    const num = Number(param);
    return typeof param === 'string' && num ? num : param;
  },
  boolean: param =>
    param === 'false' || param === 'true' ? param === 'true' : param,
};

const applyValueConverters = param =>
  Object.keys(valueConverters).reduce(
    (p, vckey) => valueConverters[vckey](p),
    param
  );

/**
 * puts query params into the params in the hash to the scope
 */
const parseHashQuery = function() {
  // query params in url
  const split = window.location.hash.split('?');
  // parse query string found in hash
  const params = parse(split[1]);
  return Object.keys(params).reduce(
    (acc, key) => ({
      ...acc,
      [key]: applyValueConverters(params[key]),
    }),
    {}
  );
};

const defaultRouteFn = (route, obs, changeRoute, parentRoute) => (
  ...innerRouteParams
) => {
  const innerParams = parentRoute
    .split('/')
    .filter(t => t.indexOf(':') !== -1)
    .reduce(
      (_innerParams, paramKey, i) => ({
        ..._innerParams,
        [paramKey.substr(1)]: innerRouteParams[i],
      }),
      {}
    );
  const params = parseHashQuery();
  const persistedParams = routerStateStore.updateRouteState(route.name, params);
  const curRoute = window.location.hash.substr(1);
  if (Object.keys(persistedParams).length > 0) {
    const stringifiedParams = stringify(persistedParams);
    const separator = curRoute.indexOf('?') === -1 ? '?' : '&';
    const newRoute = curRoute + separator + stringifiedParams;
    changeRoute(newRoute);
  } else {
    obs.next({
      ...(route.defaultParams || {}),
      ...params,
      name: route.name,
      ...innerParams,
      route: curRoute,
    });
  }
};

const routeCreator = (rootRoute, obs, changeRoute, parentRoute = '') => {
  const routeKeys = Object.keys(rootRoute);
  return routeKeys.indexOf('name') !== -1
    ? defaultRouteFn(rootRoute, obs, changeRoute, parentRoute)
    : routeKeys.reduce(
        (routeDict, routeKey) => ({
          ...routeDict,
          [routeKey]: routeCreator(
            rootRoute[routeKey],
            obs,
            changeRoute,
            parentRoute + routeKey
          ),
        }),
        {}
      );
};

const appRoute = {
  '/': {
    name: ROUTE_ROOT,
  },
  '/metrics': {
    '/': {
      defaultParams: METRICS_DEFAULT_PARAMS,
      name: ROUTE_METRICS,
    },
  },
  '/robots': {
    '/': {
      defaultParams: ROBOTS_DEFAULT_PARAMS,
      name: ROUTE_ROBOTS,
    },
    '/:robot': {
      defaultParams: {
        ...DEFAULT_TIME_PROPS,
        ...SESSION_DETAILS_DEFAULT_PARAMS,
      },
      name: ROUTE_ROBOTS_DETAILS,
    },
  },
  '/requests': {
    '/': {
      defaultParams: REQUESTS_DEFAULT_PARAMS,
      name: ROUTE_REQUESTS,
    },
    '/:session': {
      defaultParams: SESSION_DETAILS_DEFAULT_PARAMS,
      name: ROUTE_REQUESTS_DETAILS,
    },
  },
  '/status': {
    '/': {
      name: ROUTE_STATUS,
    },
  },
  '/addresses': {
    '/': {
      defaultParams: ADDRESSES_DEFAULT_PARAMS,
      name: ROUTE_ADDRESSES,
    },
    '/:address': {
      defaultParams: ADDRESSES_DEFAULT_PARAMS,
      name: ROUTE_ADDRESSES_DETAILS,
    },
  },
  '/rules': {
    '/': {
      name: ROUTE_RULES,
    },
  },
};

/**
 * Sets params for the current route, this will not alter window.location.
 * Only change the params internally.
 */
const routeParamsUpdate$ = Observable.fromEvent(
  viewEvents,
  V_UPDATE_ROUTE_PARAMS
).startWith({});

/**
 * Page holds an instance of the Director.js router. Emits objects containing
 * the name of the route to use with additional data from the URL.
 *
 * This is a `ConnectableObservable` meaning it will not start emitting events
 * until after `onRouteChange.connect()` is called.
 *
 * @fires Router#RouteChange
 */
export const routeChange$ = Observable.create(obs => {
  const routerFns = (() => {
    let router = null;
    let waitingRoute = null;
    return {
      setRouteWhenReady(route) {
        if (!router) {
          waitingRoute = route;
        } else {
          router.setRoute(route);
        }
      },
      setRouter(_router) {
        router = _router;
        if (waitingRoute) {
          router.setRoute(waitingRoute);
        }
      },
    };
  })();

  const subscription = Observable.fromEvent(viewEvents, V_SET_ROUTE).subscribe(
    ({ route }) => routerFns.setRouteWhenReady(route)
  );

  const router = new Router(
    routeCreator(appRoute, obs, routerFns.setRouteWhenReady)
  ).configure({
    run_handler_in_init: true,
  });
  router.init('/');

  routerFns.setRouter(router);

  return () => {
    subscription.unsubscribe();
  };
})
  .switchMap(params =>
    routeParamsUpdate$.map(updates => ({ ...params, ...updates }))
  )
  .publish();

/**
 * Filter by checking the `name` prop of the a record emitted by Page
 */
const routeFilter = test => ({ name }) => test === name;

/**
 * Creates an observable that emits when the routeFilter matches `test`. Used
 * for creating all the routes.
 */
const withRoute = test => routeChange$.filter(routeFilter(test));

/**
 * Starts publishing events from the router.
 */
export const initRouter = _ => routeChange$.connect();

export const rootRoute$ = withRoute(ROUTE_ROOT)
  .publishReplay(1)
  .refCount();

export const metricsRoute$ = withRoute(ROUTE_METRICS)
  .publishReplay(1)
  .refCount();

export const robotsRoute$ = withRoute(ROUTE_ROBOTS)
  .publishReplay(1)
  .refCount();

export const robotDetailsRoute$ = withRoute(ROUTE_ROBOTS_DETAILS);

export const requestsRoute$ = withRoute(ROUTE_REQUESTS);

export const requestDetailsRoute$ = withRoute(ROUTE_REQUESTS_DETAILS);

export const statusRoute$ = withRoute(ROUTE_STATUS);

export const addressesRoute$ = withRoute(ROUTE_ADDRESSES);

export const addressDetailsRoute$ = withRoute(ROUTE_ADDRESSES_DETAILS);

export const rulesRoute$ = withRoute(ROUTE_RULES);
