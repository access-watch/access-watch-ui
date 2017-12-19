import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import '../../../scss/scroll_top_button.scss';

export default class ScrollTopButton extends React.Component {
  static propTypes = {
    offset: PropTypes.number,
    onScrollTop: PropTypes.func,
  };

  static defaultProps = {
    offset: 80,
    onScrollTop: _ => {},
  };

  constructor(props) {
    super(props);
    this.state = { visible: false };
  }

  componentDidMount = _ => {
    window.addEventListener('scroll', this.handleScroll);
  };

  componentWillUnmount = _ => {
    window.removeEventListener('scroll', this.handleScroll);
  };

  handleScroll = _ => {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const { offset } = this.props;
    const { visible } = this.state;

    if (!visible && scrollTop >= offset) {
      this.setState({
        visible: true,
      });
    }

    if (visible && scrollTop < offset) {
      this.setState({
        visible: false,
      });
    }
  };

  scrollToTop = _ => {
    window.scrollTo(0, 0);
    this.props.onScrollTop();
  };

  render() {
    const { visible } = this.state;

    return (
      <div
        className={cx('scroll-top-button', {
          'scroll-top-button--visible': visible,
        })}
        onClick={this.scrollToTop}
        onKeyPress={this.scrollToTop}
      >
        Scroll to top
      </div>
    );
  }
}
