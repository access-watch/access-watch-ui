// Directorjs will try to use the node version of itself. We want to test with
// the browser version!
jest.setMock('director', require.requireActual('director/build/director'));

const EventEmitter = require.requireActual('events');

describe('router', () => {
  let Router, EventHub, emitter;

  beforeEach(() => {
    emitter = new EventEmitter();
    EventHub = require('../src/event_hub');
    EventHub.viewEvents = emitter;

    Router = require('../src/router');
  });

  it('parses and includes queryParams', () =>
    new Promise(resolve => {
      const { V_SET_ROUTE } = EventHub;
      const { routeChange$ } = Router;
      const route = '/robots?LOL=BOLL&a=1&offset=123';

      // skip default route
      routeChange$.subscribe(resolve);

      Router.initRouter();

      emitter.emit(V_SET_ROUTE, { route });

      // Director has a setTimeout to fix some old chrome bug. So timers has to be
      // run for director to do something!
      jest.runAllTimers();
    }).then(route => {
      expect(route).toEqual({
        ...Router.ROBOTS_DEFAULT_PARAMS,
        name: Router.ROUTE_ROBOTS,
        LOL: 'BOLL',
        a: 1,
        offset: 123,
        route: '/robots?LOL=BOLL&a=1&offset=123',
      });
    }));

  it('updates the params of the current route', () =>
    new Promise(resolve => {
      const { V_SET_ROUTE, V_UPDATE_ROUTE_PARAMS } = EventHub;
      const { routeChange$ } = Router;
      const route = '/robots?foo=bar&bar=foo';

      routeChange$.skip(2).subscribe(resolve);

      Router.initRouter();

      jest.runOnlyPendingTimers();

      emitter.emit(V_SET_ROUTE, { route });

      jest.runOnlyPendingTimers();

      emitter.emit(V_UPDATE_ROUTE_PARAMS, { foo: 'baz' });

      jest.runAllTimers();
    }).then(route => {
      // replace old
      expect(route.foo).toBe('baz');
      // only update, preserve existing
      expect(route.bar).toBe('foo');
    }));
});
