import { robotsRoute$, robotDetailsRoute$ } from '../../src/router';
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

const obsRobots = robotSessions$.map(
  ({ sessions: robots, sessionDetails: robotDetails, ...sessionProps }) => ({
    robots,
    robotDetails,
    ...sessionProps,
  })
);

export default obsRobots;
