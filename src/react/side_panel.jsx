import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransitionGroup } from 'react-transition-group';
import cx from 'classnames';
import omit from 'blacklist';

import { V_SET_ROUTE, dispatch } from '../event_hub';
import { keydown, KEY_CODE } from '../utilities/interaction';

import '../../scss/side-panel.scss';

export const sidePanelPropTypes = {
  bgRoute: PropTypes.string.isRequired,
  BEMblock: PropTypes.string,
  childTransitionName: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default class extends React.Component {
  static propTypes = sidePanelPropTypes;

  static defaultProps = {
    BEMblock: '',
    childTransitionName: '',
  };

  state = {
    transform: 'translateX(100%)',
    overlayOpacity: 0,
  };

  componentDidMount() {
    this.escSubscription = keydown(KEY_CODE.ESC).subscribe(this.handleEsc);
    this.timeoutOpen = setTimeout(_ => {
      this.setState({
        transform: 'none',
        overlayOpacity: 1,
      });
    }, 0);
    const { body } = document;
    if (body.className) {
      body.className += ' ';
    }
    body.className += 'no-scroll';
  }

  componentWillUnmount() {
    this.escSubscription.unsubscribe();
    clearTimeout(this.timeoutClose);
    clearTimeout(this.timeoutOpen);
    document.body.className = document.body.className.replace(
      / ?no-scroll/,
      ''
    );
  }

  mutedEsc = false;

  handleEsc = () => {
    if (!this.mutedEsc) {
      this.handleClose();
    }
  };

  muteEsc = v => {
    this.mutedEsc = v;
  };

  handleClose = () => {
    const { bgRoute } = this.props;
    if (this.timeoutClose) {
      // already closing. chill out!
      return;
    }
    this.timeoutClose = setTimeout(_ => {
      dispatch({ type: V_SET_ROUTE, route: `/${bgRoute}` });
    }, 500);

    this.setState({
      overlayOpacity: 0,
      transform: 'translateX(100%)',
    });
  };

  render() {
    const overlayStyle = { opacity: this.state.overlayOpacity };
    const contentStyle = { transform: this.state.transform };
    const { BEMblock, childTransitionName } = this.props;
    const childClassName = React.Children.only(this.props.children).type.name;
    const child =
      this.props.children &&
      React.cloneElement(this.props.children, {
        ...omit(this.props, 'children'),
        handleClose: this.handleClose,
        key: childClassName,
        muteParentEsc: this.muteEsc,
      });

    return (
      <div className={cx('side-panel', `side-panel--${BEMblock}`)}>
        <div
          style={overlayStyle}
          onClick={this.handleClose}
          onKeyPress={this.handleClose}
          className={`side-panel__overlay side-panel__overlay--${BEMblock}`}
        />
        <div
          style={contentStyle}
          className={`side-panel__content side-panel__content--${BEMblock}`}
        >
          {childTransitionName && (
            <CSSTransitionGroup
              component="div"
              transitionName={childTransitionName}
              transitionEnterTimeout={500}
              transitionLeaveTimeout={500}
            >
              {child}
            </CSSTransitionGroup>
          )}
          {!childTransitionName && child}
        </div>
      </div>
    );
  }
}
