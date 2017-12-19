import { poll, api } from './api';
import { sToMs } from '../utilities/time';
import { convertObjKeyValues } from '../utilities/object';
import { getAvgSpeedAndCount } from './utils';

const DEFAULT_POLL_INTERVAL = 5000;

const addAvgSpeed = s => ({
  ...s,
  ...getAvgSpeedAndCount(s),
});

const timeKeys = ['start', 'end', 'updated'];
const convertTime = s =>
  convertObjKeyValues({ keys: timeKeys, convertFn: sToMs })(s);

const transformSession = s => addAvgSpeed(convertTime(s));

export const getSessionsObs = (
  { type, sort, filter, limit },
  pollInterval = DEFAULT_POLL_INTERVAL
) => {
  const suffix = (type && `/${type}`) || '';
  return poll(
    () => api.get(`/sessions${suffix}`, { sort, filter, limit }),
    pollInterval
  ).map(arr => arr.map(transformSession));
};

export const getSessionDetails = ({ type, id }) =>
  api.get(`/sessions/${type}/${id}`).then(transformSession);

export const getSessionDetailsObs = (
  { type, id },
  pollInterval = DEFAULT_POLL_INTERVAL
) => poll(() => getSessionDetails({ type, id }), pollInterval);
