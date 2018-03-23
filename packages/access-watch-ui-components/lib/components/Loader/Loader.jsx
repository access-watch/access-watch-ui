import React from 'react';
import PropTypes from 'prop-types';

import './Loader.scss';

const Loader = ({ color }) => (
  <div className="loader">
    <div
      className="loader__circle"
      style={{
        ...(color ? { backgroundColor: color } : {}),
      }}
    />
  </div>
);

Loader.propTypes = {
  color: PropTypes.string,
};

Loader.defaultProps = {
  color: null,
};

export default Loader;
