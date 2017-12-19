import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import omit from 'blacklist';

import '../../../scss/button.scss';

export default class Button extends React.Component {
  static propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    action: PropTypes.any, // something to return from the onClick handler, instead of the event
    onClick: PropTypes.func,
    children: PropTypes.node,
    className: PropTypes.string,
  };

  static defaultProps = {
    action: null,
    onClick: _ => _,
    children: null,
    className: '',
  };

  handleClick = e => {
    const { onClick, action } = this.props;
    onClick(action || e);
  };

  render() {
    const { children, className, ...btnProps } = this.props;
    return (
      <button
        {...omit(btnProps, 'action', 'onClick')}
        onClick={this.handleClick}
        className={cx('btn', className)}
      >
        <div style={{ display: 'inline-block' }}>{children}</div>
      </button>
    );
  }
}
