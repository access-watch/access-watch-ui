const timerangesDividers = [
  {
    divider: 1,
    short: 's',
  },
  {
    divider: 60,
    short: 'm',
  },
  {
    divider: 60 * 60,
    short: 'h',
  },
  {
    divider: 60 * 60 * 24,
    short: 'd',
  },
];

const timerangeDisplay = (from, to) => {
  const seconds = Math.round((to - from) / 1000);
  const sortedDividers = timerangesDividers.sort(
    (a, b) => a.divider < b.divider
  );
  const timerangeDivider =
    sortedDividers.find(({ divider }) => divider < seconds) ||
    sortedDividers[sortedDividers.length - 1];
  return `${Math.round(seconds / timerangeDivider.divider)}${
    timerangeDivider.short
  } interval`;
};

// Remove the eslint-disable if this file has more exports
/* eslint-disable import/prefer-default-export */
export const timeDisplay = ({ timerangeFrom, timerangeTo }) =>
  (timerangeFrom && timerangeDisplay(timerangeFrom, timerangeTo)) ||
  'last 24 hours';
