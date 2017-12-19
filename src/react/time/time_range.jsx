import React from 'react';
import PropTypes from 'prop-types';

import { formatOnlyHour, formatDayAndMonth } from '../../i18n';

import '../../../scss/time_range.scss';

const timeRangeDetails = t => (
  <span className="time-range__time">
    <span className="time-range__time__hour">{`${formatOnlyHour(t)} `}</span>
    <span className="time-range__time__month">({formatDayAndMonth(t)})</span>
  </span>
);

const timeRange = ({ x, x1 }) => (
  <div className="time-range">
    <span className="time-range__text">Selected time :</span>
    {timeRangeDetails(x)}
    <span className="time-range__separator" />
    {timeRangeDetails(x1)}
  </div>
);

timeRange.propTypes = {
  x: PropTypes.number.isRequired,
  x1: PropTypes.number.isRequired,
};

export default timeRange;
