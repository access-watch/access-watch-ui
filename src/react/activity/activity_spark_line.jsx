import React from 'react';
import PropTypes from 'prop-types';

import { lighten } from '../../utilities/color';

import SparkLine from '../graph/spark_line';

const baseColor = '#46396a';
const lightColor = '#5599ff';

const ActivitySparkLine = ({ id, speeds: { perMinute } }) => (
  <SparkLine
    height={15}
    dataPoints={[...perMinute, ...Array(14 - perMinute.length).fill(0)]}
    intensityGradient={{
      id,
      stops: [
        {
          offset: 10,
          color: baseColor,
        },
        {
          offset: 80,
          color: lightColor,
        },
        {
          offset: 90,
          color: lighten(lightColor, 0.15),
        },
      ],
    }}
  />
);

ActivitySparkLine.propTypes = {
  id: PropTypes.string.isRequired,
  speeds: PropTypes.shape({
    perMinute: PropTypes.array,
  }).isRequired,
};

export default ActivitySparkLine;
