import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import './Alert.scss';

const Alert = ({children, onClose, type}) => (
  <div
    className={cx(
      'aw-alert',
      `aw-alert--${type}`
    )}
  >
    <div
      onClick={onClose}
      className="aw-alert__close"
    />
    {children}
  </div>
);

Alert.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func,
  type: PropTypes.string
};

export default Alert;
