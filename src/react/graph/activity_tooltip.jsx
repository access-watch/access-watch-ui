import React from 'react';
import PropTypes from 'prop-types';

import { formatDayAndMonth, formatOnlyHour, formatNumber } from '../../i18n';

const ActivityTooltip = ({ xValue, yValues }) => (
  <div className="activity-tooltip">
    <div className="activity-tooltip__date-time">
      <div className="activity-tooltip__date">{formatDayAndMonth(xValue)}</div>
      <div className="activity-tooltip__time">{formatOnlyHour(xValue)}</div>
    </div>
    <div className="activity-tooltip__values">
      {Object.keys(yValues).map(status => (
        <div
          className={`activity-tooltip__value activity-tooltip__value--${status}`}
          key={status}
        >
          {formatNumber(yValues[status])}
        </div>
      ))}
    </div>
  </div>
);

ActivityTooltip.propTypes = {
  xValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  yValues: PropTypes.objectOf(PropTypes.number).isRequired,
};

export default ActivityTooltip;
