import React from 'react';
import { PropTypes } from 'prop-types';
import { CSSTransitionGroup } from 'react-transition-group';
import cx from 'classnames';

import DropdownItem from './DropdownItem';

import './Dropdown.scss';

export default class Dropdown extends React.Component {
  static propTypes = {
    activeKey: PropTypes.string,
    values: PropTypes.shape({ text: PropTypes.string }),
    onChange: PropTypes.func,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    select: PropTypes.bool,
    keepPlaceholder: PropTypes.bool,
    children: PropTypes.node,
    closeDropdownAction: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    buttonStyle: PropTypes.object,
    onDropdownStateChange: PropTypes.func,
    // eslint-disable-next-line react/require-default-props
    open: PropTypes.bool,
    animate: PropTypes.bool,
    ariaButtonLabel: PropTypes.string,
  };

  static defaultProps = {
    activeKey: null,
    values: {},
    onChange: _ => _,
    className: '',
    placeholder: 'Select',
    select: true,
    keepPlaceholder: false,
    children: null,
    closeDropdownAction: 'onClick',
    buttonStyle: {},
    onDropdownStateChange: _ => _,
    animate: false,
    ariaButtonLabel: 'Dropdown',
  };

  constructor() {
    super();
    this.state = {
      open: false,
    };
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.checkClick, false);
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.checkClick, false);
  }

  onClickOutside = () => {
    this.changeOpenState(false);
  };

  getOpenState = _ =>
    'open' in this.props ? this.props.open : this.state.open;

  checkClick = ({ target }) => {
    if (!this.dropdownNode.contains(target)) {
      this.onClickOutside();
    }
  };

  toggleOpen = e => {
    e.stopPropagation();
    this.changeOpenState();
  };

  changeOpenState = state => {
    const { onDropdownStateChange } = this.props;
    const open = typeof state === 'boolean' ? state : !this.getOpenState();
    if (onDropdownStateChange && 'open' in this.props) {
      onDropdownStateChange(open);
    } else {
      this.setState({
        open,
      });
    }
  };

  handleChange = value => {
    this.changeOpenState(false);
    this.props.onChange(value);
  };

  createChildItem = (c, i) => {
    const { closeDropdownAction } = this.props;
    if (!c) {
      return c;
    }
    const props = { key: c.key || i };
    if (closeDropdownAction) {
      props[closeDropdownAction] = (...args) => {
        this.onClickOutside();
        return (
          c.props[closeDropdownAction] && c.props[closeDropdownAction](...args)
        );
      };
    }
    return React.cloneElement(c, props);
  };

  render() {
    const {
      values,
      activeKey,
      className,
      placeholder,
      select,
      keepPlaceholder,
      children,
      buttonStyle,
      animate,
      ariaButtonLabel,
    } = this.props;
    const open = this.getOpenState();

    return (
      <div
        ref={ref => {
          this.dropdownNode = ref;
        }}
        className={cx('dropdown', className, { 'dropdown--open': open })}
      >
        {select && (
          <button
            className={cx('dropdown_label', `dropdown_label--${activeKey}`)}
            onClick={this.toggleOpen}
            style={buttonStyle}
            aria-haspopup="true"
            aria-expanded={open.toString()}
          >
            {(!activeKey || keepPlaceholder) && placeholder}
            {activeKey && keepPlaceholder && ' '}
            {activeKey && Object.keys(values).length
              ? values[activeKey].text
              : activeKey}
            <span
              className={cx('dropdown_icon', { 'dropdown_icon-open': open })}
            />
          </button>
        )}
        {!select && (
          <button
            className={cx('dropdown_button')}
            onClick={this.toggleOpen}
            style={buttonStyle}
            aria-haspopup="true"
            aria-expanded={open.toString()}
            aria-label={ariaButtonLabel}
          />
        )}
        <CSSTransitionGroup
          transitionEnter={animate}
          transitionLeave={animate}
          transitionEnterTimeout={200}
          transitionLeaveTimeout={200}
          transitionName="transition_dropdown"
          component="div"
        >
          {open &&
            (children ? (
              <div className="dropdown_children-wrapper">
                {React.Children.map(children, this.createChildItem)}
              </div>
            ) : (
              <ul key="list" className="dropdown_items">
                {Object.keys(values).map(val => (
                  <li key={val}>
                    <DropdownItem
                      id={val}
                      onClick={this.handleChange}
                      text={values[val].text}
                      isActive={!select && val === activeKey}
                      onChange={this.handleInputChange}
                    />
                  </li>
                ))}
              </ul>
            ))}
        </CSSTransitionGroup>
      </div>
    );
  }
}
