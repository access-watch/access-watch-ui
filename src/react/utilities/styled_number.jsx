import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const StyledNumber = ({ value, locales, toLocaleStringOptions, theme }) => {
  const valueLocaleString = value.toLocaleString(
    locales,
    toLocaleStringOptions
  );
  const fractionSign = (0.1).toLocaleString(locales).substr(1, 1);
  const [intValue, fraction] = valueLocaleString.split(fractionSign);

  return (
    <span
      className={cx('styled-number', { [`styled-number--${theme}`]: theme })}
    >
      <span className="styled-number__integer">{intValue}</span>
      {fraction && (
        <span className="styled-number__fraction-sign">{fractionSign}</span>
      )}
      {fraction && <span className="styled-number__fraction">{fraction}</span>}
    </span>
  );
};

StyledNumber.propTypes = {
  value: PropTypes.number.isRequired,
  locales: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  toLocaleStringOptions: PropTypes.object,
  theme: PropTypes.string,
};

StyledNumber.defaultProps = {
  locales: 'en-US',
  toLocaleStringOptions: {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  theme: '',
};

export default StyledNumber;
