import { Observable, Subject } from 'rxjs';
jest.useRealTimers(); // fake timers doesnt work here for some reason

const TARGET = '../../src/model/create_logs_factory';

const FAKE_LOGS = [
  { id: 1, time: 10, address: { value: '1.10.25' } },
  { id: 2, time: 12, address: { value: '1.10.22' } },
  { id: 3, time: 14, address: { value: '1.10.28' } },
  { id: 4, time: 16, address: { value: '1.10.25' } },
  { id: 5, time: 17, address: { value: '1.10.24' } },
  { id: 6, time: 20, address: { value: '1.10.30' } },
  { id: 7, time: 23, address: { value: '1.10.21' } },
];

// this is a nasty little thing that makes jest spit out the errors that
// happens if assertions are rejected in an observable that's being tested.
// usage: return p(observable$.do(assertions)). rxjs otherwise swallows the
// errors that jest throws when an assertion rejects because expections are
// 'forbidden' in the subscription
const pr = o => new Promise((res, rej) => o.subscribe(res, rej));

describe('create_logs_factory', () => {
  let createLogsFactory, api, handleAction, transformLog, actionSubject;
  beforeEach(() => {
    actionSubject = new Subject();
    createLogsFactory = require(TARGET).default;
    handleAction = jest.fn(type =>
      actionSubject.filter(act => act.type === type)
    );
    transformLog = jest.fn(x => x);
    api = {
      request: jest.fn(p => Observable.defer(_ => Observable.fromPromise(p()))),
      poll: jest.fn(p => Observable.defer(_ => Observable.fromPromise(p()))),
      http: {
        get: jest.fn(_ => Promise.resolve({ logs: [] })),
        post: jest.fn(_ => Promise.resolve()),
      },
      ws: {
        createSocket: jest.fn(_ => Observable.empty()),
      },
    };
  });

  it('creates a factory function', () => {
    const createLogs = createLogsFactory({ api, handleAction, transformLog });
    const logs$ = createLogs({});

    expect(logs$.subscribe).toBeInstanceOf(Function);
  });

  it('immediately emits initial state', () => {
    api.ws.createSocket.mockReturnValue(Observable.never());
    const createLogs = createLogsFactory({ api, handleAction, transformLog });
    const logs$ = createLogs({});

    return pr(
      logs$.do(logs => {
        expect(api.ws.createSocket.mock.calls.length).toBe(1);
        expect(logs.loading).toBe(true);
        expect(logs.streamOpen).toBe(false);
        expect(logs.logs).toEqual([]);
        expect(logs.earlierLoading).toBe(false);
      })
    );
  });

  it('streams through websocket', () => {
    const socketLogs = FAKE_LOGS;
    api.ws.createSocket.mockImplementation((_endpoint, _params, onOpen) => {
      setTimeout(_ => onOpen());

      return Observable.merge(
        Observable.of(...socketLogs),
        Observable.never() // ensure that the sequence never completes
      );
    });

    const createLogs = createLogsFactory({ api, handleAction, transformLog });

    const logs$ = createLogs({});

    return pr(
      logs$.skip(2).do(({ logs, streamOpen }) => {
        expect(streamOpen).toBe(true);
        expect(logs).toEqual(socketLogs);
        expect(api.ws.createSocket.mock.calls.length).toBe(1);
      })
    );
  });

  it('reuses stored logs', () => {
    const logs = FAKE_LOGS;
    api.ws.createSocket.mockImplementation((_endpoint, _params, onOpen) => {
      setTimeout(_ => onOpen());

      return Observable.merge(
        Observable.of(...logs),
        Observable.never() // ensure that the sequence never completes
      );
    });

    const createLogs = createLogsFactory({ api, handleAction, transformLog });
    const logs$ = createLogs({});

    return pr(
      logs$.skip(2).do(a => {
        const obsLogs = a.logs;
        expect(obsLogs).toEqual(logs);
        const logs2$ = createLogs({});
        logs2$.do(b => {
          expect(b.logs).toEqual(obsLogs);
        });
      })
    );
  });
});
