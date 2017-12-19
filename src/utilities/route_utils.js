import { stringify, parse } from 'qs';
import omit from 'blacklist';

const getRouteParams = route => {
  const paramsIdx = route.indexOf('?');
  if (paramsIdx !== -1) {
    return parse(route.slice(paramsIdx + 1));
  }
  return {};
};

const getRouteWithoutParams = r =>
  r.slice(0, (r.indexOf('?') + 1 || r.length + 1) - 1);

const getNextRoute = (r, ro) => getRouteWithoutParams(ro || r);

const getStringifiedRouteWithArgs = (r, args) =>
  Object.keys(args).length > 0 ? r + '?' + stringify(args) : r;

export const deleteRouteParameter = ({ route, param, newRoute }) =>
  getStringifiedRouteWithArgs(
    getNextRoute(route, newRoute),
    omit(getRouteParams(route), param)
  );

export const updateRouteParameter = ({ route, param, value, newRoute }) =>
  value
    ? getStringifiedRouteWithArgs(getNextRoute(route, newRoute), {
        ...getRouteParams(route),
        ...{ [param]: value },
      })
    : deleteRouteParameter({ route, param, newRoute });
