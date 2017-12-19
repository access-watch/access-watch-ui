const TARGET = '../../src/utilities/route_utils';

describe('routeUtils', () => {
  let updateRouteParameter, deleteRouteParameter, stringify;
  const route = '/test';
  const routeParams = {
    foo: 'bar',
    baz: 'foobar',
  };
  const routeParamsWithArr = {
    foo: ['bar', 'baz'],
  };

  beforeEach(() => {
    /* eslint-disable prefer-destructuring */
    updateRouteParameter = require(TARGET).updateRouteParameter;
    deleteRouteParameter = require(TARGET).deleteRouteParameter;
    stringify = require('qs').stringify;
    /* eslint-enable prefer-destructuring */
  });

  it('adds param to route without param', () => {
    const param = Object.keys(routeParams)[0];
    const newRoute = updateRouteParameter({
      route,
      param,
      value: routeParams[param],
    });
    expect(newRoute).toEqual(route + '?' + param + '=' + routeParams[param]);
  });

  it('updates param', () => {
    const param = Object.keys(routeParams)[0];
    const orgRoute = route + '?' + param + '=test';
    const newRoute = updateRouteParameter({
      route: orgRoute,
      param,
      value: routeParams[param],
    });
    expect(newRoute).toEqual(route + '?' + param + '=' + routeParams[param]);
  });

  it('adds, updates and deletes param on route with params', () => {
    const params = Object.keys(routeParams);
    const param = params[1];
    const orgRoute = route + '?' + params[0] + '=test';
    const newRoute = updateRouteParameter({
      route: orgRoute,
      param,
      value: routeParams[param],
    });
    expect(newRoute).toEqual(orgRoute + '&' + param + '=' + routeParams[param]);
    const newNewRoute = updateRouteParameter({
      route: newRoute,
      param,
      value: 'test',
    });
    expect(newNewRoute).toEqual(orgRoute + '&' + param + '=test');
    expect(deleteRouteParameter({ route: newRoute, param })).toEqual(orgRoute);
  });

  it('deletes param', () => {
    const param = Object.keys(routeParams)[0];
    const orgRoute = route + '?' + param + '=test';
    const newRoute = deleteRouteParameter({ route: orgRoute, param });
    expect(newRoute).toEqual(route);
  });

  it('works with array params', () => {
    const param = Object.keys(routeParamsWithArr)[0];
    const newRoute = updateRouteParameter({
      route,
      param,
      value: routeParamsWithArr[param],
    });

    expect(newRoute).toEqual(route + '?' + stringify(routeParamsWithArr));
    const newArrayParam = {
      [param]: [...routeParamsWithArr[param], 'barbaz'],
    };
    const newNewRoute = updateRouteParameter({
      route: newRoute,
      param,
      value: newArrayParam[param],
    });
    expect(newNewRoute).toEqual(route + '?' + stringify(newArrayParam));

    const withoutParamRoute = deleteRouteParameter({ route: newRoute, param });
    expect(withoutParamRoute).toEqual(route);
  });
});
