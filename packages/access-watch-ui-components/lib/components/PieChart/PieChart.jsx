import React from 'react';
import PropTypes from 'prop-types';

import './PieChart.scss';

// source: https://github.com/chenglou/tween-functions/blob/master/index.js
// t: current time, c: final value, d: total duration
// eslint-disable-next-line
const easeInCubic = (t, c, d) => c * (t /= d) * t * t;

const percentageToPath = ({ cx, cy, r }) => (percentage, percentageOffset) => {
  const actualPercentage = Math.min(0.9999, percentage) + percentageOffset;
  const calcCoords = p => ({
    x: cx + r * Math.cos( 2 * Math.PI * p),
    y: cy + r * Math.sin( 2 * Math.PI * p)
  });
  const start = calcCoords(percentageOffset);
  const end = calcCoords(actualPercentage);
  const largeArc = percentage > 0.5 ? 1 : 0;
  return `M ${end.x} ${end.y} A ${r} ${r}, 0, ${largeArc}, 0, ${start.x} ${start.y} L ${cx} ${cy} Z`;
}

const distributionsAreEqual = (distributionsSet1, distributionsSet2) => {
  const inequal = distributionsSet1.some(({ name, percentage }, i) => {
    const item2 = distributionsSet2[i];
    return !item2 || item2.name !== name || item2.percentage !== percentage;
  });
  return !inequal && distributionsSet1.length === distributionsSet2.length;
}

class PieChart extends React.Component {
  static propTypes = {
    distributions: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        percentage: PropTypes.number
      })
    ),
    onClick: PropTypes.func,
    className: PropTypes.string,
    animate: PropTypes.bool,
    animationDuration: PropTypes.number,
  }

  static defaultProps = {
    animationDuration: 1000,
  }

  constructor(props) {
    super(props);
    this.state = {
      distributions: props.animate ?
        props.distributions.map(d => ({ ...d, percentage: 0 })) :
        props.distributions
    };
  }

  componentDidMount() {
    const { animate } = this.props;
    if (animate) {
      this.currentAnimation = window.requestAnimationFrame(this.animatePieChart);
    }
  }

  componentWillReceiveProps({ animate, distributions }) {
    if (!distributionsAreEqual(distributions, this.props.distributions)) {
      if (this.hasFullfilledAnimation || !animate) {
        this.setState({ distributions });
      } else {
        window.cancelAnimationFrame(this.currentAnimation);
        this.currentAnimation = null;
        this.animateStart = null;
        this.setState({
          distributions: distributions.map(d => ({ ...d, percentage: 0 }))
        });
        this.currentAnimation = window.requestAnimationFrame(this.animatePieChart);
      }
    }
  }

  componentWillUnmount() {
    const { currentAnimation } = this;
    if (currentAnimation) {
      window.cancelAnimationFrame(currentAnimation);
    }
  }

  animatePieChart = timestamp => {
    if (!this.animateStart) {
      this.animateStart = timestamp;
    }
    const { distributions, animationDuration } = this.props;
    const progress = Math.min(timestamp - this.animateStart, animationDuration);
    this.setState({
      distributions: distributions.map(d => ({
        ...d,
        percentage: easeInCubic(progress, d.percentage, animationDuration)
      }))
    });
    if (progress < animationDuration) {
      this.currentAnimation = window.requestAnimationFrame(this.animatePieChart);
    } else {
      this.currentAnimation = null;
      this.animateStart = null;
      this.hasFullfilledAnimation = true;
    }
  }

  render() {
    const { onClick, className } = this.props;
    const { distributions } = this.state;
    return (
      <svg className={`pie-chart ${className}`} width="200" height="200" viewBox="0 0 200 200" >
        <circle
          cx="100"
          cy="100"
          r="100px"
          className="pie-chart__empty"
        />
        {distributions.map(({name, percentage}, i) => (
          <path
            className={`pie-chart__chunk pie-chart__chunk--${name}`}
            key={name}
            d={
              percentageToPath({ cx: 100, cy: 100, r: 100 })(
                percentage,
                (0.75 + distributions.slice(0, i).reduce((val, {percentage}) => val + percentage, 0)) % 1)
            }
            onClick={() => { if (onClick) onClick(name); }}
            style={onClick ? { cursor: 'pointer' } : {}}
          />
        ))}
        <circle
          cx="100"
          cy="100"
          r="45px"
          className="pie-chart__mask"
        />
      </svg>
    );
  }
}

export default PieChart;
