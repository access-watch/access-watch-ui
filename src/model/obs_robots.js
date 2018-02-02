import { Observable } from 'rxjs';
import {
  routeChange$,
  robotsRoute$,
  robotDetailsRoute$,
} from '../../src/router';
import { robotsMetrics$ } from './obs_robots_metrics';
import { createSessions$ } from './obs_session';

export const type = 'robot';
export const logMapping = 'robot.id';

const createFilter = ({ reputation }) => ({
  ...(reputation ? { filter: `reputation.status:${reputation}` } : {}),
});

const robotSessions$ = createSessions$({
  route$: robotsRoute$,
  routeDetails$: robotDetailsRoute$,
  createFilter,
  type,
  routeId: 'robot',
  logMapping,
});

const allRobotsRoute$ = Observable.merge(robotsRoute$, robotDetailsRoute$);

const obsRobots = Observable.combineLatest(
  robotSessions$,
  allRobotsRoute$.switchMap(_ => robotsMetrics$.takeUntil(routeChange$))
).map(
  ([
    {
      sessions: robots,
      sessionDetails: robotDetails,
      route,
      routeDetails,
      activity,
    },
    robotsMetrics,
  ]) => ({
    route,
    routeDetails,
    robots,
    robotDetails,
    robotsMetrics,
    activity,
  })
);

export default obsRobots;
