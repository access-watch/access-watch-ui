import React from 'react';

import { capitalize } from '../../utilities/string';
import { formatNumber } from '../../i18n';

import ActivityCell from './activity_cell';

const createSpeedResolvers = ({
  id,
  label = capitalize(id),
  sortable = false,
}) => [
  {
    id,
    label: `${label} (24h)`,
    resolver: obj => formatNumber(obj[id].count),
    sortable,
  },
  {
    id: `${id}Activity`,
    label: 'Activity (15m)',
    resolver: obj => (
      <ActivityCell
        id={`${obj.id}${capitalize(id)}`}
        speeds={obj[id].speeds}
        speed={obj[id].speed}
      />
    ),
    sortable,
  },
];

export default createSpeedResolvers;
