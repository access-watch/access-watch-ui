import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import '../../../scss/sessions/abstract_session_details_row_block.scss';

const AbstractSessionDetailsRowBlock = ({ label, children, modifier }) => (
  <div
    className={cx('session-details__row-block', {
      [`session-details__row-block--${modifier}`]: modifier,
    })}
  >
    <div className="session-details__row-block__label session-details__row-block__text-label--thin">
      {label}
    </div>
    <div>{children}</div>
  </div>
);

AbstractSessionDetailsRowBlock.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  modifier: PropTypes.string,
};

AbstractSessionDetailsRowBlock.defaultProps = {
  modifier: null,
};

export default AbstractSessionDetailsRowBlock;
