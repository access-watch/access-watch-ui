import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import '../../../scss/sessions/session_block.scss';
import TimeAgo from '../utilities/time_ago';
import { formatNumber } from '../../i18n';
import {
  SESSIONS_MIN_WIDTH_DESKTOP,
  SESSIONS_MIN_HEIGHT_DESKTOP,
} from './treemap_tools';
import { reputationPropType } from '../prop_types';

class SessionBlock extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    x: PropTypes.number,
    y: PropTypes.number,
    icon: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    country: PropTypes.string,
    type: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    updated: PropTypes.number.isRequired,
    speed: PropTypes.string,
    reputation: reputationPropType,
    blocked: PropTypes.bool,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    x: 0,
    y: 0,
    country: null,
    speed: null,
    reputation: null,
    blocked: false,
    onClick: _ => _,
  };

  state = {
    highlight: false,
  };

  componentWillReceiveProps(nextProps) {
    const { count } = this.props;
    const { count: nextCount } = nextProps;

    if (count < nextCount) {
      this.setState({
        highlight: true,
      });

      // Clear any pending flashTimeout, keep the block highlighted
      window.clearTimeout(this.timeoutFlash);

      this.timeoutFlash = setTimeout(() => {
        this.setState({
          highlight: false,
        });
      }, 350); // dehighlight after a few ms
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this.timeoutFlash);
  }

  timeoutFlash = null;

  size() {
    let { width, height } = this.props;
    width *= SESSIONS_MIN_WIDTH_DESKTOP / 100;
    height *= SESSIONS_MIN_HEIGHT_DESKTOP / 100;

    let size = 'small';
    if (width > 125 && height > 75) {
      size = 'large';
    } else if (width > 100 && height > 50) {
      size = 'medium';
    }

    return size;
  }

  handleClick = e => {
    // don't trigger the link
    e.preventDefault();
    this.props.onClick(this.props.id);
  };

  render() {
    const {
      width,
      height,
      x,
      y,
      icon,
      title,
      country,
      type,
      count,
      updated,
      speed,
      reputation,
      blocked,
    } = this.props;

    const size = this.size();

    const blockStyle = {
      width: width + '%',
      height: height + '%',
      top: y + '%',
      left: x + '%',
    };

    let className = 'session-block';

    className += ` session-block--${size}`;

    if (reputation) {
      className += ` session-block--${reputation.status}`;
    }

    if (this.state.highlight) {
      className += ' session-block--highlight';
    }

    return (
      <div
        className={className}
        style={blockStyle}
        onClick={this.handleClick}
        onKeyPress={this.handleClick}
      >
        <div
          className={cx('session-block__content', {
            'session-block__content--blocked': blocked,
          })}
        >
          {icon &&
            React.cloneElement(icon, { className: 'session-block__icon' })}
          <div className={cx('session-block__title')}>{title}</div>
          {size !== 'small' && (
            <div className="session-block__details">
              <span className="session-block__identity">
                {country && size === 'large' && <div>{country}</div>}
                {country &&
                  size !== 'large' && (
                    <span>
                      {' '}
                      {country} <wbr /> &middot;{' '}
                    </span>
                  )}
                {type}
                <wbr /> &middot; {formatNumber(count)} requests
                <wbr /> &middot;{' '}
                {speed ||
                  (updated && (
                    <span>
                      latest <TimeAgo time={new Date(updated)} />
                    </span>
                  ))}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default SessionBlock;
