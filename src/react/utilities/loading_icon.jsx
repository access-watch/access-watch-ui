import React from 'react';
import PropTypes from 'prop-types';
import LOGO_RAW from '!raw-loader!../../../assets/access-watch-nofill.svg'; //eslint-disable-line
import SVGIcon from './svg_icon';

import '../../../scss/loading-icon.scss';

const LoadingIcon = ({ message, icon, height }) => (
  <div className="loading-icon" style={{ height }}>
    <SVGIcon svg={icon} />
    <p>{message}</p>
  </div>
);

LoadingIcon.propTypes = {
  message: PropTypes.string,
  icon: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

LoadingIcon.defaultProps = {
  message: 'one moment please...',
  icon: LOGO_RAW,
  height: 'auto',
};

export default LoadingIcon;
