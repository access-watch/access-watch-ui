import React from 'react';
import cx from 'classnames';
import { Observable, Scheduler } from 'rxjs';
import { viewEvents, V_SHOW_TOOLTIP, V_SET_TOOLTIP } from '../../event_hub';

import '../../../scss/tooltip.scss';

const handleAction = type => Observable.fromEvent(viewEvents, type);

// set up a global tooltip component that follows mouse
const mousePos$ = Observable.fromEvent(window, 'mousemove')
  .map(e => [e.clientX, e.clientY])
  .observeOn(Scheduler.animationFrame)
  .publishReplay(1);

// TODO: sidepanel probably wont trigger scroll event on window
const scroll$ = Observable.fromEvent(window, 'scroll').publish();

mousePos$.connect();
scroll$.connect();

// Obs<bool>
const visible$ = Observable.merge(
  scroll$.mapTo(false),
  handleAction(V_SHOW_TOOLTIP).map(act => act.visible)
);

const message$ = handleAction(V_SET_TOOLTIP).map(act => act.message);

const initialState = {
  pos: [-999, -999],
  message: <span />,
  visible: false,
};

const tooltipState$ = Observable.merge(
  visible$.map(visible => state => ({ ...state, visible })),
  message$.map(message => state => ({ ...state, message })),
  mousePos$.map(pos => state => ({ ...state, pos }))
).scan((state, patch) => patch(state), initialState);

// This is meant to be a single and independent instance
export default class Tooltip extends React.Component {
  state = initialState;

  componentWillMount = () => {
    this.tooltipStateSubscription = tooltipState$.subscribe(
      this.setState.bind(this)
    );
  };

  componentWillUnmount = () => {
    this.tooltipStateSubscription.unsubscribe();
  };

  render() {
    const { pos: [x, y], visible, message } = this.state;
    return (
      <div
        key="tooltip"
        className={cx('tooltip', { 'tooltip--visible': visible })}
        style={{
          left: 0,
          top: 12,
          transform: `translate3d(${x}px, ${y}px, 0)`,
        }}
      >
        <div className="tooltip__message">{message}</div>
      </div>
    );
  }
}
