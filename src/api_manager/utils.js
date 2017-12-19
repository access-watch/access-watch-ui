import { convertBackendKeys } from '../utilities/object';

export const extractTimerange = ({ timerangeFrom, timerangeTo, ...props }) => ({
  ...props,
  ...(timerangeFrom && { start: new Date(timerangeFrom) }),
  ...(timerangeTo && { end: new Date(timerangeTo) }),
});

const sumArray = arr => arr.reduce((sum, v) => sum + v, 0);

export const getAvgSpeedAndCount = ({ speed: originalSpeed }) => {
  const speeds = convertBackendKeys(originalSpeed);
  // First speed returned is always an approximation, so ignore it if we have others
  if (speeds.perMinute.length > 1) {
    speeds.perMinute.shift();
  }
  const { perMinute, perHour } = speeds;
  const speed = perMinute.length ? sumArray(perMinute) / perMinute.length : 0;
  const count = sumArray(perHour);
  return {
    speeds,
    speed,
    count,
  };
};
