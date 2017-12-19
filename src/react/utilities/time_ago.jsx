import React from 'react';
import PropTypes from 'prop-types';
import { formatTimeSince } from '../../i18n';

export default class TimeAgo extends React.Component {
  constructor() {
    super();
    this.state = {
      ago: '',
    };
    this.update = this.update.bind(this);
  }

  componentWillMount() {
    // 1001ms to be pretty sure that the time has changed one sec since last
    this.interval = setInterval(this.update, 1001);
    this.update();
  }

  shouldComponentUpdate(_, nextState) {
    return this.state.ago !== nextState.ago;
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  update() {
    const secondsAgo = Math.floor(
      (Date.now() - this.props.time.getTime()) / 1000
    );
    if (secondsAgo < 60) {
      // TODO: maybe not necessary anymore
      // replace less than a minute with actual seconds
      this.setState({
        // using hard coded english!
        ago: `${secondsAgo} seconds ago`,
      });
    } else {
      this.setState({
        ago: formatTimeSince(this.props.time, { compact: false }),
      });
    }
  }

  render() {
    return <span className="time-ago">{this.state.ago}</span>;
  }
}

TimeAgo.propTypes = {
  time: PropTypes.instanceOf(Date).isRequired,
};
