const { Observable } = require('rxjs/Rx');

module.exports = {
  ...jest.genMockFromModule('../router'),
  metricsRoute$: Observable.never(),
  robotsRoute$: Observable.never(),
  robotDetailsRoute$: Observable.never(),
  requestsRoute$: Observable.never(),
  routeChange$: Observable.never(),
  addressesRoute$: Observable.never(),
  statusRoute$: Observable.never(),
};
