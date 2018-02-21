import config from '../../app_config';
import { pickKeys } from '../../utilities/object';
import { tableResolvers } from './resolvers';
import { timerangeDisplay, timeDisplay } from '../../utilities/timerange';

export const hasTimerange = route => route.timerangeFrom && route.timerangeTo;
export const canDisplayTimerange = config.session.timerange;
export const isTimerangeDisplay = route =>
  hasTimerange(route) && canDisplayTimerange;
export const pickTimerangeKeys = pickKeys(['timerangeFrom', 'timerangeTo']);

const tableResolversNoActivity = tableResolvers.filter(
  ({ id }) => ['speed', 'activity'].indexOf(id) === -1
);

export const getTimerangeTableResolvers = route =>
  isTimerangeDisplay(route)
    ? tableResolversNoActivity.map(resolver => ({
        ...resolver,
        ...(resolver.id === 'count'
          ? { label: `Count (${timerangeDisplay(route, ['d'])})` }
          : {}),
      }))
    : tableResolvers;

export const getTimeDisplay = route =>
  isTimerangeDisplay(route)
    ? timeDisplay(pickTimerangeKeys(route), 'session')
    : timeDisplay({}, 'session');
