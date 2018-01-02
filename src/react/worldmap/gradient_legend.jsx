import React from 'react';
import PropTypes from 'prop-types';
import { calculateColorGradient } from '../../utilities/color';

export default class GradientLegend extends React.Component {
  static propTypes = {
    colorMin: PropTypes.string.isRequired,
    colorMax: PropTypes.string.isRequired,
    gradientFactor: PropTypes.number.isRequired,
    precision: PropTypes.number,
    reverse: PropTypes.bool,
  };

  static defaultProps = {
    precision: 20,
    reverse: false,
  };

  render() {
    const {
      colorMin,
      colorMax,
      gradientFactor,
      precision,
      reverse,
    } = this.props;

    const getStopColor = function(percentage) {
      const cMin = reverse ? colorMax : colorMin;
      const cMax = reverse ? colorMin : colorMax;
      const factor = reverse ? 1 / gradientFactor : gradientFactor;
      return calculateColorGradient(factor, cMin, cMax, percentage);
    };

    const precisionRange = Array(precision + 1)
      .fill(0)
      .map((_, i) => i);

    return (
      <svg
        viewBox="0 0 1000 100"
        height="100%"
        width="100%"
        preserveAspectRatio="xMaxYMax slice"
      >
        <defs>
          <linearGradient id="gradient">
            {precisionRange.map(x => (
              <stop
                key={x}
                offset={`${x / precision * 100}%`}
                stopColor={getStopColor(x / precision)}
              />
            ))}
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="1000" height="100" fill="url(#gradient)" />
      </svg>
    );
  }
}
