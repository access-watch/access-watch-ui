import React from 'react';
import PropTypes from 'prop-types';

import './Pill.scss';

const Pill = ({ children, onDelete, className, ...props }) => (
  <div className={`aw-pill ${className}`} {...props}>
    <div className="aw-pill__content">{children}</div>
    <div className="aw-pill__delete">
      <button className="aw-pill__delete-btn" onClick={onDelete} />
    </div>
  </div>
);

Pill.propTypes = {
  children: PropTypes.node.isRequired,
  onDelete: PropTypes.func.isRequired,
  className: PropTypes.string,
};

Pill.defaultProps = {
  className: '',
};

export default Pill;
