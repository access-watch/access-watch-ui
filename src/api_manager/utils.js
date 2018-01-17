import { convertBackendKeys } from '../utilities/object';

export const extractTimerange = ({ timerangeFrom, timerangeTo, ...props }) => ({
  ...props,
  ...(timerangeFrom && { start: new Date(timerangeFrom) }),
  ...(timerangeTo && { end: new Date(timerangeTo) }),
});

const sumArray = arr => arr.reduce((sum, v) => sum + v, 0);

export const getAvgSpeedAndCount = ({ speed: originalSpeed }) => {
  const speeds = convertBackendKeys(originalSpeed);
  speeds.perMinute = [
    ...speeds.perMinute,
    ...Array(15 - (speeds.perMinute ? speeds.perMinute.length : 0)).fill(0),
  ];
  const { perMinute, perHour } = speeds;
  const speed = sumArray(perMinute) / perMinute.length;
  const count = sumArray(perHour);
  return {
    speeds,
    speed,
    count,
  };
};
