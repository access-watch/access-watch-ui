import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransitionGroup } from 'react-transition-group';

const Slide = ({ children, right }) => (
  <div style={{ position: 'relative', overflow: 'hidden' }}>
    <CSSTransitionGroup
      component="div"
      transitionName={`slide-${right ? 'right' : 'left'}`}
      transitionEnterTimeout={500}
      transitionLeaveTimeout={500}
    >
      {children}
    </CSSTransitionGroup>
  </div>
);

Slide.propTypes = {
  children: PropTypes.node.isRequired,
  right: PropTypes.bool,
};

Slide.defaultProps = {
  right: false,
};

export default Slide;
