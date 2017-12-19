import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { formatNumber } from '../../i18n';

const displayPercentageIfValid = p =>
  p
    ? formatNumber(p * 100, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
    : 0;

const ChartLabels = ({ distributions }) => (
  <div className="chart-labels">
    {distributions.map(({ name, label, percentage }) => (
      <div
        key={name}
        className={cx('chart-labels__label-wrap', {
          [`chart-labels__label-wrap--${name}`]: percentage,
        })}
      >
        <div className="chart-labels__value">
          {`${displayPercentageIfValid(percentage)}%`}
        </div>
        <span
          className={cx(
            'chart-labels__label',
            `chart-labels__label--${name}`,
            { 'chart-labels__label--triangle-up': name.length < 4 },
            { 'chart-labels__label--triangle-down': name.length >= 4 }
          )}
        >
          {label}
        </span>
      </div>
    ))}
  </div>
);

ChartLabels.propTypes = {
  distributions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      label: PropTypes.string,
      percentage: PropTypes.number,
    })
  ).isRequired,
};

export default ChartLabels;
