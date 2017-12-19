import { V_SET_ROUTE, dispatch } from '../event_hub';
import { updateRouteParameter, deleteRouteParameter } from './route_utils';

export const handleTimeRangeChanged = ({ route, x, x1 }) => {
  dispatch({
    type: V_SET_ROUTE,
    route: updateRouteParameter({
      route: updateRouteParameter({ route, param: 'timerangeFrom', value: x }),
      param: 'timerangeTo',
      value: x1,
    }),
  });
};

export const closeTimeRangeSelector = route => {
  dispatch({
    type: V_SET_ROUTE,
    route: deleteRouteParameter({
      route: deleteRouteParameter({ route, param: 'timerangeFrom' }),
      param: 'timerangeTo',
    }),
  });
};

export const getRangeFromRoute = ({ timerangeFrom, timerangeTo }) => {
  if (timerangeFrom && timerangeTo) {
    return { x: timerangeFrom, x1: timerangeTo };
  }
  return null;
};
