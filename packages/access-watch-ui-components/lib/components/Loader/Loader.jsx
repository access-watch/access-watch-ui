import React from 'react';
import PropTypes from 'prop-types';

import './Loader.scss';

const loader = ({color}) => (
  <div className="loader">
    <div
      className="loader__circle"
      style={{
        ...color ? {backgroundColor: color} : {}
      }}
    />
  </div>
);

loader.propTypes = {
  color: PropTypes.string
};

export default loader;
