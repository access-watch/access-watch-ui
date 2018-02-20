import React from 'react';
import PropTypes from 'prop-types';

import { lighten } from '../../utilities/color';
import { formatSpeedMin } from '../../i18n';

import SparkLine from '../graph/spark_line';

import '../../../scss/activity_cell.scss';

const baseColor = '#46396a';
const lightColor = '#5599ff';

const ActivityCell = ({ id, speeds: { perMinute }, speed }) => (
  <div className="activity-cell">
    <div className="activity-cell__sparkline">
      <SparkLine
        height={15}
        dataPoints={perMinute}
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
    </div>
    <div className="activity-cell__speed">{formatSpeedMin({ speed })}</div>
  </div>
);

ActivityCell.propTypes = {
  id: PropTypes.string.isRequired,
  speed: PropTypes.number.isRequired,
  speeds: PropTypes.shape({
    perMinute: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
};

export default ActivityCell;
