import { Observable } from 'rxjs';
import { poll, api } from './api';
import { sToMs, msToS, findPossibleStep } from '../utilities/time';
import {
  convertObjKeyValues,
  pickKeys,
  convertObjValues,
} from '../utilities/object';
import { getAvgSpeedAndCount, extractTimerange } from './utils';
import { hasElasticSearch } from '../utilities/config';
import { serverDataStartTime$ } from './activity_api';

const DEFAULT_POLL_INTERVAL = 5000;

const addAvgSpeed = s => ({
  ...s,
  ...getAvgSpeedAndCount(s),
});

const timeKeys = ['start', 'end', 'updated'];
const convertTime = s =>
  convertObjKeyValues({ keys: timeKeys, convertFn: sToMs })(s);

const transformSession = s => (s.speed ? addAvgSpeed(convertTime(s)) : s);

const pickTimerangeKeys = pickKeys(['start', 'end']);

const getTimeQuery$ = ({ timeSlider, ...rest }) => {
  const timerange = convertObjValues(msToS)(
    pickTimerangeKeys(extractTimerange(rest))
  );
  let startObs = Observable.of({});
  if (hasElasticSearch()) {
    startObs =
      timeSlider === 'auto'
        ? serverDataStartTime$
            .map(start => ({ start: Math.floor(start / 1000) }))
            .take(1)
        : Observable.of({
            start: Math.floor(new Date().getTime() / 1000) - timeSlider * 60,
          });
  }
  return startObs.map(timeStart => ({ ...timeStart, ...timerange }));
};

export const getSessionsObs = (
  { type, sort, filter, limit, ...rest },
  pollInterval = DEFAULT_POLL_INTERVAL
) => {
  const suffix = (type && `/${type}`) || '';
  return getTimeQuery$(rest).switchMap(timeQuery =>
    poll(
      () =>
        api.get(`/sessions${suffix}`, {
          sort,
          filter,
          limit,
          ...timeQuery,
          step: findPossibleStep(
            (Math.floor(new Date().getTime() / 1000) - timeQuery.start) * 1000
          ),
        }),
      pollInterval
    ).map(arr => arr.map(transformSession))
  );
};

export const getSessionDetails = ({ type, id, ...rest }) =>
  api.get(`/sessions/${type}/${id}`, rest).then(transformSession);

export const getSessionDetailsObs = (
  args,
  pollInterval = DEFAULT_POLL_INTERVAL
) =>
  getTimeQuery$(args).switchMap(timeQuery =>
    poll(() => getSessionDetails({ ...args, ...timeQuery }), pollInterval)
  );
