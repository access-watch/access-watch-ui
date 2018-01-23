import { Observable, ReplaySubject, Scheduler } from 'rxjs';
import { extractTimerange } from '../api_manager/utils';
import { pickKeys, getIn } from '../utilities/object';

// maximum requests that we can have renedered at the same time.
const MAX_REQUESTS = 50000;
const NO_STORAGE_PARAMS = ['timerangeFrom', 'timerangeTo'];
const REQUESTS_LIMIT = 50;

const hasNoStorageParam = params =>
  NO_STORAGE_PARAMS.reduce((acc, k) => acc || params[k], false);

const append = (a, b) => a.concat(b);

const filterLogs = (logs, filters = {}) => {
  if (!logs) {
    return [];
  }
  return Object.keys(filters).reduce(
    (filtered, key) =>
      filtered.filter(
        l => filters[key].indexOf('' + getIn(l, key.split('.'))) !== -1
      ),
    [...logs]
  );
};

const querySearchFactory = (filters = {}, q = '') => {
  const searchObject = Object.keys(filters).reduce(
    (acc, k) => ({
      ...acc,
      [k]: filters[k].join(','),
    }),
    {}
  );
  return { ...searchObject, ...(q.length > 0 ? { q } : {}) };
};

const pickParamsKeys = pickKeys(['offset', 'limit', 'before', 'after']);

let websocket$;
let websocketStatus$;

const getWebsocket = api => {
  if (!websocket$) {
    websocketStatus$ = new ReplaySubject(1);
    const handleStreamOpen = _ => {
      if (websocketStatus$) {
        websocketStatus$.next(true);
      }
    };
    const handleStreamClose = _ => {
      websocketStatus$.next(false);
      websocket$ = null;
      websocketStatus$ = null;
    };
    websocket$ = api.ws
      .createSocket('/logs', null, handleStreamOpen, handleStreamClose)
      .bufferTime(100);
  }
  return { ws$: websocket$, wsStatus$: websocketStatus$.asObservable() };
};

export default ({ api, transformLog, store: logsStore = {} }) => {
  // creates a stream of logs using websocket or polling as fallback
  const streamLogs = initLogs => params => {
    let initLogsObs;
    if (initLogs.length > 0) {
      initLogsObs = Observable.of(initLogs);
    } else {
      initLogsObs = api.request(_ =>
        api.http
          .get('/logs', {
            ...pickParamsKeys(params),
            ...querySearchFactory(params.filters, params.q),
          })
          .then(logs => logs.map(transformLog))
      );
    }
    const { ws$, wsStatus$ } = getWebsocket(api);
    const logs$ = initLogsObs.switchMap(firstLogs =>
      ws$
        .map(slogs => filterLogs(slogs, params.filters))
        .filter(entries => entries.length > 0)
        .map(logs => logs.map(transformLog))
        .startWith(initLogs.length > 0 ? [] : firstLogs)
    );
    return [logs$, wsStatus$];
  };

  const getSelection = logsParams =>
    'logs:' + (logsParams.filters ? JSON.stringify(logsParams.filters) : '');

  // store logs that can be shown at a later state
  // for instance instead of loading
  const storeLogs = logsParams => state => {
    if (!hasNoStorageParam(logsParams)) {
      // eslint-disable-next-line
      logsStore[getSelection(logsParams)] = state.logs;
    }
  };

  const getInitialLogs = logsParams => {
    // the current bucket or selection of logs
    const sel = getSelection(logsParams);

    // TODO: We could do some basic filtering on existing logs if we want to
    return hasNoStorageParam(logsParams) ? [] : logsStore[sel] || [];
  };

  return logsParams => {
    let p = {
      ...logsParams,
    };

    if (!p.filtersEnabled) {
      delete p.filters;
      delete p.filtersEnabled;
    }

    const initialLogs = getInitialLogs(p);

    const initialState = {
      loading: true,
      logs: initialLogs,
      streamOpen: false,
      earlierLoading: false,
    };

    delete p.name; // unused

    p.limit = REQUESTS_LIMIT;

    if (initialLogs.length > 0) {
      delete p.offset;
    }

    // never use `after` param for initially because who know's where and when
    // prior logs came
    delete p.after;

    p = extractTimerange(p);

    // [Observable<[log]>, Observable<isOpen>]
    const [_logs$, isOpen$] = streamLogs(initialLogs)(p);

    // we use the same sequence for all subscriptions so we don't do redundant
    // api calls
    const logs$ = _logs$.share();

    const patch$ = Observable.merge(
      isOpen$.map(open => state => ({
        ...state,
        streamOpen: open,
        loading: false,
      })),

      logs$.map(logs => state => ({
        ...state,
        logs: append(logs, state.logs).slice(0, MAX_REQUESTS),
      }))
    );

    return Observable.of(initialState)
      .merge(patch$.observeOn(Scheduler.queue))
      .scan((stored, patch) => patch(stored))
      .do(storeLogs(p));
  };
};
