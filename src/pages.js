import React from 'react';
import { Observable } from './rx';

import sessionDetails from './model/session_details';
import metricsStore$ from './store/obs_metrics_store';
import { globalActivity$ } from './model/obs_activity';
import { metricsLoading$ } from './api_manager';
import createLogs from './model/create_logs';
import metrics$ from './model/obs_metrics';
import addresses$ from './model/obs_addresses';

import status$ from './model/obs_status';
import robots$ from './model/obs_robots';
import rules$ from './model/obs_rules';
import MetricsPageComponent from './react/pages/metrics';
import RobotsPageComponent from './react/pages/robots';
import RequestsPageComponent from './react/pages/requests';
import SessionDetailsComponent from './react/sessions/session_details';
import StatusPageComponent from './react/pages/status';
import AddressesPageComponent from './react/pages/addresses';
import AddressDetails from './react/address/address_details';
import RulesPageComponent from './react/pages/rules';

import {
  metricsRoute$,
  requestsRoute$,
  requestDetailsRoute$,
  routeChange$,
  ROUTE_REQUESTS_DETAILS,
  ROUTE_REQUESTS,
} from './router';

/**
 * @event Pages#PageChange
 * @type {object}
 * @property {ReactElement} element main element to render
 * @property {ReactElement} [sidePanel] optional side panel extra (for detailed
 * info)
 * @property {string} name Name for this route everything we use for the navbar
 * atm
 */

/**
 * Observable that emits the Sessions overview page.
 * @fires Pages#PageChange
 */
export const onRobotsPage = robots$.map(
  ({ route, routeDetails, robots, robotDetails, robotsMetrics, activity }) => ({
    element: (
      <RobotsPageComponent
        robots={robots}
        route={route}
        metrics={robotsMetrics}
        activity={activity}
      />
    ),
    name: 'robots',
    ...(robotDetails
      ? {
          sidePanel: {
            element: (
              <SessionDetailsComponent {...robotDetails} route={routeDetails} />
            ),
            BEMblock: 'session-details',
            bgRoute: 'robots',
          },
        }
      : {}),
  })
);

/**
 * @fires Pages#PageChange
 */
export const onMetricsPage = metrics$
  .withLatestFrom(metricsRoute$)
  .map(([metrics, route]) => ({
    element: <MetricsPageComponent {...metrics} route={route} />,
    name: 'metrics',
  }));

/**
 * @fires Pages#PageChange
 */
export const onLogsPage = routeChange$
  .startWith(null)
  .bufferCount(2, 1)
  // Ensure that we're not coming from log details page, in that case we've left
  // the sequence running as seen below, so don't create a new one.
  // There is an edge case when init the page from log details, in that case
  // there's no sequence running already so we also let through if the sequence
  // index <= 2
  .filter(
    ([prev, next], i) =>
      next.name === ROUTE_REQUESTS &&
      (i < 2 || ROUTE_REQUESTS_DETAILS !== prev.name)
  )
  .map(([_, route]) => route) // ok continue as usual
  .switchMap(requestsRoute =>
    Observable.combineLatest(
      createLogs(requestsRoute),
      Observable.combineLatest(metricsStore$, metricsLoading$).map(
        ([metrics, metricsLoading]) => ({ ...metrics, loading: metricsLoading })
      ),
      Observable.of(requestsRoute),
      globalActivity$,
      // inner route! so that the current page does not need to re-init.
      requestDetailsRoute$
        .switchMap(detailsRoute =>
          sessionDetails(detailsRoute)
            .combineLatest(Observable.of(detailsRoute))
            .takeUntil(routeChange$)
            // complete with [] means no sidepanel
            .concat(Observable.of([]))
        )
        // emitting [] because theres no side panel to show when this route is
        // not triggered
        .startWith([])
    )
      // continue to take from the even while details are open. We do this because
      // don't have a way to paginate upwards atm. but it could be useful at a
      // later stage. Keep the sequence running when navigating back to logs too!
      .takeUntil(
        routeChange$.filter(
          ({ name }) => ![ROUTE_REQUESTS, ROUTE_REQUESTS_DETAILS].includes(name)
        )
      )
  )
  .map(([logs, metrics, route, activity, [details, detailsRoute]]) => ({
    element: (
      <RequestsPageComponent
        {...logs}
        logEnd={logs.end}
        metrics={metrics}
        route={route}
        activity={activity}
      />
    ),
    sidePanel: details && {
      element: (
        <SessionDetailsComponent
          {...details}
          requestInfo={logs.logs.find(l => l.id === detailsRoute.hl)}
          route={detailsRoute}
        />
      ),
      BEMblock: 'session-details',
      bgRoute: 'requests',
    },
    name: 'requests',
  }));

export const onLogDetailsPage = requestDetailsRoute$
  // Only use this route until logs route has been visited. This is because we
  // only use this seq to support deep links. The details are otherwise
  // triggered while at the logs page.
  // This is *hacky* because it wont allow us to paste a log details link after
  // visting logs unless we're on the logs page because the url will not trigger
  // a reload but only a hash change. It's not so common that this happens :p
  .takeUntil(requestsRoute$)
  .switchMap(requestDetailsRoute =>
    Observable.combineLatest(
      sessionDetails(requestDetailsRoute),
      // Get empty state without actually loading anything yet.
      // TODO: Can be set through default props in the view?
      Observable.of([
        {
          loading: true,
          bufferedLogs: [],
          logs: [],
        },
        {
          requests: { speed: {} },
        },
      ]),
      Observable.of(requestDetailsRoute),
      globalActivity$
    ).takeUntil(routeChange$)
  )
  .map(([details, [logs, metrics], route, activity]) => ({
    element: (
      <RequestsPageComponent
        {...logs}
        metrics={metrics}
        route={route}
        activity={activity}
      />
    ),
    sidePanel: {
      element: <SessionDetailsComponent {...details} route={route} />,
      BEMblock: 'session-details',
      bgRoute: 'requests',
    },
    name: 'logs',
  }));

export const onStatusPage = status$.map(({ status, statusLoading }) => ({
  element: <StatusPageComponent status={status} loading={statusLoading} />,
  name: 'status',
}));

export const onAddressesPage = addresses$.map(
  ({
    route,
    routeDetails,
    addresses,
    addressDetails,
    robotsMetrics,
    activity,
  }) => ({
    element: (
      <AddressesPageComponent
        addresses={addresses}
        route={route}
        robotsMetrics={robotsMetrics}
        activity={activity}
      />
    ),
    name: 'addresses',
    ...(addressDetails
      ? {
          sidePanel: {
            element: (
              <AddressDetails {...addressDetails} route={routeDetails} />
            ),
            BEMblock: 'session-details',
            bgRoute: 'addresses',
          },
        }
      : {}),
  })
);

export const onRulesPage = rules$.map(({ rules }) => ({
  element: <RulesPageComponent rules={rules} />,
  name: 'rules',
}));

metricsLoading$.subscribe();

/**
 * @fires Pages#PageChange
 */
export default Observable.merge(
  onMetricsPage,
  onRobotsPage,
  onLogsPage,
  onLogDetailsPage,
  onStatusPage,
  onAddressesPage,
  onRulesPage
);
