import { Observable } from 'rxjs';
import {
  routeChange$,
  robotsRoute$,
  robotDetailsRoute$,
} from '../../src/router';
import { robotsMetrics$ } from './obs_robots_metrics';
import { createSessions$ } from './obs_session';

export const type = 'robot';
export const logFilter = ({ log, session }) => log.session.id === session.id;

const createFilter = ({ reputation }) => ({
  ...(reputation ? { filter: `reputation.status:${reputation}` } : {}),
});

const robotSessions$ = createSessions$({
  route$: robotsRoute$,
  routeDetails$: robotDetailsRoute$,
  createFilter,
  type,
  routeId: 'robot',
  logMapping: 'robot.id',
});

const allRobotsRoute$ = Observable.merge(robotsRoute$, robotDetailsRoute$);

const obsRobots = Observable.combineLatest(
  robotSessions$,
  allRobotsRoute$.switchMap(_ => robotsMetrics$.takeUntil(routeChange$))
).map(
  ([
    { sessions: robots, sessionDetails: robotDetails, route, routeDetails },
    robotsMetrics,
  ]) => ({
    route,
    routeDetails,
    robots,
    robotDetails,
    robotsMetrics,
  })
);

export default obsRobots;
