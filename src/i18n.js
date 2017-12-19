import format from 'date-fns/format';
import Timeago from 'timeago.js';

// the local dict example is below.
// register your locale with timeago
Timeago.register(
  'en_compact',
  (number, index) =>
    [
      // number: the timeago / timein number;
      // index: the index of array below;
      ['just now', 'right now'],
      ['%ssec ago', 'in %s seconds'],
      ['1min ago', 'in 1 minute'],
      ['%smin ago', 'in %s minutes'],
      ['1h ago', 'in 1 hour'],
      ['%sh ago', 'in %s hours'],
      ['1d ago', 'in 1 day'],
      ['%sd ago', 'in %s days'],
      ['1w ago', 'in 1 week'],
      ['%sw ago', 'in %s weeks'],
      ['1 month ago', 'in 1 month'],
      ['%s months ago', 'in %s months'],
      ['a year ago', 'in 1 year'],
      ['%s years ago', 'in %s years'],
    ][index]
);

export const formatDate = d => format(new Date(d), 'YYYY-MM-DD');
export const formatDateAndTime = d =>
  format(new Date(d), 'YYYY-MM-DD HH:mm:ss');
export const formatDayAndMonth = d => format(new Date(d), 'MMM DD');
export const formatOnlyHour = d => format(new Date(d), 'HH:mm:ss');
export const formatNumber = (n, opts) =>
  n && Number(n).toLocaleString('en-US', opts);
export const formatPercentage = (n, opts) =>
  formatNumber(n, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...opts,
  });
export const formatTimeSince = (d, opts = { compact: true }) =>
  new Timeago().format(d, opts.compact ? 'en_compact' : 'en');
export const formatPrice = ({ value, currency = '€' }) =>
  `${formatPercentage(value)} ${currency}`;
export const formatSpeedMin = ({ speed }) =>
  formatNumber(speed, { maximumFractionDigits: 2 }) + '/min';
