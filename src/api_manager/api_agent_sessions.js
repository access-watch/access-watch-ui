import { poll, api } from './api';
import { sToMs, msToS } from '../utilities/time';
import {
  convertObjKeyValues,
  pickKeys,
  convertObjValues,
} from '../utilities/object';
import { getAvgSpeedAndCount, extractTimerange } from './utils';
import { hasElasticSearch, getExpiration } from '../utilities/config';

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

export const getSessionsObs = (
  { type, sort, filter, limit, timeSlider, ...rest },
  pollInterval = DEFAULT_POLL_INTERVAL
) => {
  const suffix = (type && `/${type}`) || '';
  const timerange = convertObjValues(msToS)(
    pickTimerangeKeys(extractTimerange(rest))
  );
  return poll(
    () =>
      api.get(`/sessions${suffix}`, {
        sort,
        filter,
        limit,
        ...(hasElasticSearch()
          ? {
              start:
                Math.floor(new Date().getTime() / 1000) -
                (timeSlider === 'auto'
                  ? getExpiration('session')
                  : timeSlider * 60),
            }
          : {}),
        ...timerange,
      }),
    pollInterval
  ).map(arr => arr.map(transformSession));
};

export const getSessionDetails = ({ type, id }) =>
  api.get(`/sessions/${type}/${id}`).then(transformSession);

export const getSessionDetailsObs = (
  { type, id },
  pollInterval = DEFAULT_POLL_INTERVAL
) => poll(() => getSessionDetails({ type, id }), pollInterval);
