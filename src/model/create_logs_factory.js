import { Observable, ReplaySubject, Scheduler } from 'rxjs';
import { filters as awSdkFilters } from 'access-watch-sdk';
import { extractTimerange } from '../api_manager/utils';
import { pickKeys, getIn } from '../utilities/object';
import { msToS } from '../utilities/time';
import { createURIToFilters } from '../utilities/filter';
import { V_REQUEST_EARLIER_LOGS } from '../event_hub';

// maximum requests that we can have renedered at the same time.
const MAX_REQUESTS = 50000;
const NO_STORAGE_PARAMS = ['start', 'end'];
const REQUESTS_LIMIT = 50;
const filtersDef = awSdkFilters.log;

const hasNoStorageParam = params =>
  NO_STORAGE_PARAMS.reduce((acc, k) => acc || params[k], false);

const append = (a, b) => a.concat(b);

const URIToFilters = createURIToFilters();

const getLogFilter = ({ id, values }) => log => {
  const filterDef = filtersDef.find(f => f.id === id) || {};
  const keyPath = id.split('.');
  const logValue = getIn(log, keyPath);
  let compFn = v => logValue === v;
  if (filterDef.fullText) {
    compFn = v => logValue.indexOf(v) !== -1;
  }
  if (Array.isArray(logValue)) {
    compFn = v => logValue.indexOf(v) !== -1;
  }
  return values.findIndex(compFn) !== -1;
};

const getLogFilters = filters => log =>
  filters.map(getLogFilter).reduce((bool, fn) => bool && fn(log), true);

const filterLogs = (logs, filtersURI = '') => {
  if (!logs) {
    return [];
  }
  const filters = URIToFilters(filtersURI).map(({ values, ...f }) => ({
    ...f,
    values: values.map(v => {
      const { transform = _ => _ } =
        filtersDef.find(filterDef => filterDef.id === f.id) || {};
      return transform(v);
    }),
  }));
  return logs.filter(getLogFilters(filters));
};

const pickParamsKeys = pickKeys(['offset', 'limit', 'start', 'end']);
const transformTimerange = ({ start, end, ...rest }) => ({
  ...rest,
  ...(start ? { start: msToS(start) } : {}),
  ...(end ? { end: msToS(end) } : {}),
});

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
    };
    websocket$ = api.ws
      .createSocket('/logs', null, handleStreamOpen, handleStreamClose)
      .bufferTime(100);
  }
  return { ws$: websocket$, wsStatus$: websocketStatus$.asObservable() };
};

export default ({ api, transformLog, store: logsStore = {}, handleAction }) => {
  // creates a stream of logs using websocket or polling as fallback
  const streamLogs = initLogs => params => {
    let initLogsObs;
    if (initLogs.length > 0) {
      initLogsObs = Observable.of(initLogs);
    } else {
      initLogsObs = api.request(_ =>
        api.http
          .get('/logs', {
            ...transformTimerange(pickParamsKeys(params)),
            ...pickKeys(['filter'])(params),
          })
          .then(logs => logs.map(transformLog))
      );
    }
    const { ws$, wsStatus$ } = getWebsocket(api);
    let logs$;
    if (params.start) {
      logs$ = initLogsObs;
    } else {
      logs$ = initLogsObs.switchMap(firstLogs =>
        ws$
          .map(slogs => filterLogs(slogs, params.filter))
          .filter(entries => entries.length > 0)
          .map(logs => logs.map(transformLog))
          .startWith(initLogs.length > 0 ? [] : firstLogs)
      );
    }
    return [logs$, wsStatus$];
  };

  const getSelection = logsParams =>
    'logs:' + (logsParams.filter ? JSON.stringify(logsParams.filter) : '');

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

  const earlierLogsMatching = p => act =>
    act.logMapping &&
    p.filter &&
    p.filter[act.logMapping] === act.logMappingValue;

  const earlierLogs = p =>
    handleAction(V_REQUEST_EARLIER_LOGS)
      .filter(earlierLogsMatching)
      .switchMap(act =>
        api.request(_ =>
          api.http
            .get('/logs', {
              ...transformTimerange(pickParamsKeys(p)),
              end: msToS(act.end),
              ...pickKeys(['filter'])(act),
              limit: REQUESTS_LIMIT,
            })
            .then(logs => ({
              logs: logs.map(transformLog),
              end: msToS(act.end),
            }))
        )
      );

  return logsParams => {
    let p = {
      ...logsParams,
    };

    p = extractTimerange(p);

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
      })),

      earlierLogs(p).map(({ logs, end }) => state => {
        let i = 0;
        const logsOverlap = logs.filter(
          ({ request }) => new Date(request.time).getTime() >= (end - 1) * 1000
        );
        let newLogs = [...logsOverlap];
        const getNthLast = x => state.logs[state.logs.length - (x + 1)];
        let latestLog = getNthLast(0);
        while (
          new Date(latestLog.request.time).getTime() <= end * 1000 &&
          i < state.logs.length
        ) {
          // eslint-disable-next-line no-loop-func
          newLogs = newLogs.filter(l => l.id !== latestLog.id);
          i++;
          latestLog = getNthLast(i);
        }
        newLogs = logs.slice(logsOverlap.length).concat(newLogs);
        return {
          ...state,
          logs: state.logs.concat(logs.slice(i)).slice(-MAX_REQUESTS),
          end: logs.length < REQUESTS_LIMIT,
          earlierLoading: false,
        };
      }),

      handleAction(V_REQUEST_EARLIER_LOGS)
        .filter(earlierLogsMatching)
        .map(_ => state => ({
          ...state,
          earlierLoading: true,
        }))
    );

    return Observable.of(initialState)
      .merge(patch$.observeOn(Scheduler.queue))
      .scan((stored, patch) => patch(stored))
      .do(storeLogs(p));
  };
};
