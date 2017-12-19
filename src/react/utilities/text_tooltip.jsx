import React from 'react';
import cx from 'classnames';
import { viewEvents, V_SHOW_TEXT_TOOLTIP } from '../../event_hub';

import { Observable } from '../../rx';

import '../../../scss/text-tooltip.scss';

const tooltipMaxWidth = 450;

const getNodePos = n => {
  const { width, bottom, left } = n.getBoundingClientRect();
  const nodePos = left + width / 2;
  const leftOverflow = nodePos - tooltipMaxWidth / 2 < 0;
  const rightOverflow = nodePos + tooltipMaxWidth / 2 > window.innerWidth;
  return { left: leftOverflow, right: rightOverflow, pos: [nodePos, bottom] };
};

const onScroll = Observable.fromEvent(window, 'scroll').share();

const show$ = Observable
  // view event that triggers a tooltip to become visible and populated with
  // a message provided in the event
  .fromEvent(viewEvents, V_SHOW_TEXT_TOOLTIP)
  // replace sequence, keeping only the latest!
  .switchMap(
    // delay the event a bit
    d =>
      Observable.of(d)
        .delay(500)
        .takeUntil(Observable.fromEvent(d.node, 'mouseleave'))
        // complete sequence after first value emitted
        .take(1)
  )
  .filter(data => document.contains(data.node))
  // oki figure out where to put the tooltip message.
  .map(data => ({
    ...getNodePos(data.node),
    ...data,
  }));

const hide$ = show$
  // after a tooltip is shown...
  .switchMap(({ node }) =>
    Observable.merge(
      // hide if the user moves away the mouse
      Observable.fromEvent(node, 'mouseleave'),
      // also hide on scroll since it wont trigger a mouseout
      onScroll,
      // if it turns out mouse is over something else, also remove
      Observable.fromEvent(window, 'mouseover').filter(
        e => !node.contains(e.target) && !e.target.contains(node)
      )
    ).take(1)
  );

// This is meant to be a single instance. I am assuming that only one tooltip
// can be shown at a time.
class TextTooltip extends React.Component {
  constructor() {
    super();
    this.state = {
      message: null, // node to render
      pos: [0, 0], // x,y coordinates
      visible: false, // duh
    };
  }

  componentWillMount = () => {
    this.showSubscription = show$.subscribe(({ pos, left, right, message }) =>
      this.setState({ pos, left, right, message, visible: true })
    );

    this.hideSubscription = hide$.subscribe(_ =>
      this.setState({ visible: false })
    );
  };

  componentWillUnmount = () => {
    this.showSubscription.unsubscribe();
    this.hideSubscription.unsubscribe();
  };

  render() {
    const { pos: [x, y], visible, left, right } = this.state;
    return (
      <div
        className={cx(
          'text-tooltip',
          { 'text-tooltip--visible': visible },
          { 'text-tooltip--left': left },
          { 'text-tooltip--right': right }
        )}
        style={{ left: x, top: y }}
      >
        {this.state.message}
      </div>
    );
  }
}

export default TextTooltip;
