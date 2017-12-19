import React from 'react';

import { capitalize } from '../../utilities/string';
import { formatNumber, formatSpeedMin } from '../../i18n';

import ActivitySparkLine from './activity_spark_line';

const createSpeedResolvers = ({ id, label = capitalize(id) }) => [
  {
    id,
    label,
    resolver: obj => formatNumber(obj[id].count),
  },
  {
    id: `${id}Activity`,
    label: 'Activity',
    resolver: obj => (
      <ActivitySparkLine
        id={`${obj.id}${capitalize(id)}`}
        speeds={obj[id].speeds}
      />
    ),
  },
  {
    id: `${id}Speed`,
    label: 'Speed',
    resolver: obj => formatSpeedMin(obj[id]),
  },
];

export default createSpeedResolvers;
