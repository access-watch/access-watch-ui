import { poll, api } from './api';
import { sToMs, msToS, findPossibleStep } from '../utilities/time';
import {
  convertObjKeyValues,
  pickKeys,
  convertObjValues,
} from '../utilities/object';
import { getAvgSpeedAndCount, extractTimerange } from './utils';
import { hasElasticSearch, getExpiration } from '../utilities/config';
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

const getTimeQuery = ({ timeSlider, ...rest }) => {
  const timerange = convertObjValues(msToS)(
    pickTimerangeKeys(extractTimerange(rest))
  );
  return {
    ...(hasElasticSearch()
      ? {
          start:
            Math.floor(new Date().getTime() / 1000) -
            (timeSlider === 'auto' || !timeSlider
              ? getExpiration('session')
              : timeSlider * 60),
        }
      : {}),
    ...timerange,
  };
};

export const getSessionsObs = (
  { type, sort, filter, limit, ...rest },
  pollInterval = DEFAULT_POLL_INTERVAL
) => {
  const suffix = (type && `/${type}`) || '';
  const timeQuery = getTimeQuery(rest);
  return poll(
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
  ).map(arr => arr.map(transformSession));
};

export const getSessionDetails = ({ type, id, ...rest }) =>
  api.get(`/sessions/${type}/${id}`, getTimeQuery(rest)).then(transformSession);

export const getSessionDetailsObs = (
  args,
  pollInterval = DEFAULT_POLL_INTERVAL
) => poll(() => getSessionDetails(args), pollInterval);
