import { updateRouteParameter } from './route_utils';

import { dispatch, V_SET_ROUTE } from '../event_hub';

import { getExpiration } from '../utilities/config';

const timerangesDividers = [
  {
    divider: 1,
    short: 's',
    full: 'second',
  },
  {
    divider: 60,
    short: 'm',
    full: 'minute',
  },
  {
    divider: 60 * 60,
    short: 'h',
    full: 'hour',
  },
  {
    divider: 60 * 60 * 24,
    short: 'd',
    full: 'day',
  },
];

const sortedDividers = timerangesDividers.sort((a, b) => a.divider < b.divider);

const getTimeDivider = (s, dividers) =>
  dividers.find(({ divider }) => divider < s) ||
  dividers[sortedDividers.length - 1];

const getDivided = s =>
  sortedDividers.reduce((acc, div, i) => {
    const rest = s % (i === 0 ? s + 1 : sortedDividers[i - 1].divider);
    const curV = Math.floor(rest / div.divider);
    if (curV > 0) {
      return {
        ...acc,
        [div.short]: { ...div, value: curV },
      };
    }
    return acc;
  }, {});

const dividersToShortDisplay = splitted =>
  Object.keys(splitted).reduce(
    (string, k) => `${string}${splitted[k].value}${k}`,
    ''
  );

export const secondsToShortDisplay = s => dividersToShortDisplay(getDivided(s));

const secondsToHumanDisplay = s => {
  const splitted = getDivided(s);
  const keys = Object.keys(splitted);
  if (keys.length === 1) {
    const { value, full } = splitted[keys[0]];
    if (value === 1) {
      return full;
    }
    return `${value} ${full}s`;
  }
  return dividersToShortDisplay(splitted);
};

export const timerangeDisplay = (
  { timerangeFrom: from, timerangeTo: to, timeSlider },
  excludeDividers = [],
  type
) => {
  const timeSliderValue =
    timeSlider === 'auto' ? getExpiration(type) : timeSlider * 60;
  const seconds = to && from ? Math.round((to - from) / 1000) : timeSliderValue;
  const timerangeDivider = getTimeDivider(
    seconds,
    sortedDividers.filter(({ short }) => excludeDividers.indexOf(short) === -1)
  );
  return `${Math.round(seconds / timerangeDivider.divider)}${
    timerangeDivider.short
  }`;
};

export const timeDisplay = (
  { timerangeFrom, timerangeTo, timeSlider = 'auto' } = {},
  type
) =>
  (timerangeFrom &&
    timerangeDisplay({ timerangeFrom, timerangeTo }) + ' interval') ||
  'last ' +
    secondsToHumanDisplay(
      timeSlider === 'auto' ? getExpiration(type) : timeSlider * 60
    );

export const handleTimeSliderChange = (route, value) => {
  dispatch({
    type: V_SET_ROUTE,
    route: updateRouteParameter({ route, param: 'timeSlider', value }),
  });
};
