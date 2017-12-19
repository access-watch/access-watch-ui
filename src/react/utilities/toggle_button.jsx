import React from 'react';
import PropTypes from 'prop-types';

import '../../../scss/toggle_button.scss';

const ToggleButton = ({ enabled, className, onClick }) => (
  <div
    className={`toggle-button toggle-button--${
      enabled ? 'enabled' : 'disabled'
    } ${className}`}
    onClick={onClick}
    onKeyPress={onClick}
  />
);

ToggleButton.propTypes = {
  enabled: PropTypes.bool.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

ToggleButton.defaultProps = {
  className: '',
};

export default ToggleButton;
