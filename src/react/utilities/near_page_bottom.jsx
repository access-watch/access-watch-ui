import React from 'react';
import PropTypes from 'prop-types';
import { nearPageBottom } from '../../utilities/interaction';

class NearPageBottom extends React.Component {
  static propTypes = {
    onScrollNearBottom: PropTypes.func,
    children: PropTypes.func.isRequired,
  };

  static defaultProps = {
    onScrollNearBottom: null,
  };

  componentDidMount() {
    const { scrollElement = window } = this;
    const { onScrollNearBottom } = this.props;
    nearPageBottom(scrollElement).subscribe(onScrollNearBottom);
  }

  render() {
    return this.props.children({
      scrollRef: scrollElement => {
        this.scrollElement = scrollElement;
      },
    });
  }
}

export default NearPageBottom;
