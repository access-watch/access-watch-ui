import { Observable, ReplaySubject, Scheduler } from 'rxjs';
import { extractTimerange } from '../api_manager/utils';

// maximum requests that we can have renedered at the same time.
const MAX_REQUESTS = 50000;
const NO_STORAGE_PARAMS = ['timerangeFrom', 'timerangeTo'];

const hasNoStorageParam = params =>
  NO_STORAGE_PARAMS.reduce((acc, k) => acc || params[k], false);

// append b to a and ensure no dupes.
const append = (a, b) => a.concat(b);

const filterLogs = (logs, filters) => {
  if (!logs) {
    return [];
  }
  let filteredLogs = [...logs];
  if (filters) {
    if (filters.type) {
      filteredLogs = filteredLogs.filter(
        l => l.identity && filters.type.indexOf(l.identity.type) !== -1
      );
    }
    if (filters.reputation) {
      filteredLogs = filteredLogs.filter(
        l =>
          l.reputation && filters.reputation.indexOf(l.reputation.status) !== -1
      );
    }
    if (filters.status) {
      filteredLogs = filteredLogs.filter(
        l => l.response && filters.status.indexOf('' + l.response.status) !== -1
      );
    }
    if (filters.method) {
      filteredLogs = filteredLogs.filter(
        l => l.request && filters.method.indexOf('' + l.request.method) !== -1
      );
    }
  }
  return filteredLogs;
};

let websocket$;
let websocketStatus$;

const getWebsocket = api => {
  if (!websocket$) {
    websocketStatus$ = new ReplaySubject(1);
    const handleStreamOpen = _ => websocketStatus$.next(true);
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
  const streamLogs = params => {
    const { ws$, wsStatus$ } = getWebsocket(api);
    const logs$ = ws$
      .filter(entries => entries.length > 0)
      .map(slogs => filterLogs(slogs, params.filters))
      .map(logs => logs.map(transformLog));

    return [logs$, wsStatus$];
  };

  // store logs that can be shown at a later state
  // for instance instead of loading
  const storeLogs = (sessionId = 'none', logsParams) => state => {
    if (!hasNoStorageParam(logsParams)) {
      // eslint-disable-next-line
      logsStore[sessionId] = state.logs;
    }
  };

  const getSelection = logsParams =>
    '' +
    (logsParams.session_details || logsParams.session || 'none') +
    (logsParams.filters ? JSON.stringify(logsParams.filters) : '');

  const getInitialLogs = logsParams => {
    // the current bucket or selection of logs
    const sel = getSelection(logsParams);

    if (
      logsParams.filters &&
      !logsParams.session_details &&
      !logsParams.session
    ) {
      // eslint-disable-next-line
      logsStore[sel] = filterLogs(logsStore.none, logsParams.filters);
    }

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

    const sel = getSelection(p);

    const initialLogs = getInitialLogs(p);

    const initialState = {
      loading: true,
      logs: initialLogs,
      streamOpen: false,
      earlierLoading: false,
    };

    delete p.name; // unused

    if (initialLogs.length > 0) {
      delete p.offset;
    }

    // never use `after` param for initially because who know's where and when
    // prior logs came
    delete p.after;

    p = extractTimerange(p);

    // [Observable<[log]>, Observable<isOpen>]
    const [_logs$, isOpen$] = streamLogs(p);

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
      .do(storeLogs(sel, p));
  };
};
