import React from 'react';
import {PropTypes} from 'prop-types';
import cx from 'classnames';

export default class DropdownItem extends React.Component {

  static propTypes = {
    text: PropTypes.string,
    id: PropTypes.string,
    isActive: PropTypes.bool,
    onClick: PropTypes.func,
  }

  handleChange = e => {
    e.preventDefault();
    this.props.onClick(this.props.id);
  }

  render() {
    const {text, isActive, id} = this.props;
    return (
      <button
        className={cx(
          'dropdownItem',
          `dropdownItem--${id}`,
          {'dropdownItem-active': isActive}
        )}
        onClick={this.handleChange}
      >
        <p className={cx('dropdownItem_label', `dropdownItem_label--${id}`)}>{text}</p>
      </button>
    );
  }
}
