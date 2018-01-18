import React from 'react';
import cx from 'classnames';

import { formatNumber, formatSpeedMin } from '../../i18n';
import ActivityCell from '../activity/activity_cell';

import '../../../scss/sessions/aw-table_sessions.scss';

export const createReputationPreviewResolver = reputationResolver => ({
  id: 'reputationPreview',
  label: '',
  classResolver: entry => {
    const { status } = reputationResolver(entry);
    const baseClassName = 'aw-table__sessions__reputation-preview';
    return cx(baseClassName, ([`${baseClassName}--${status}`]: status));
  },
  resolver: _ => <span />,
});

export const tableResolvers = [
  {
    id: 'count',
    label: 'Count (24h)',
    resolver: ({ count }) => formatNumber(count),
    sortable: true,
  },
  {
    id: 'activity',
    label: 'Activity (last 15m)',
    resolver: ActivityCell,
  },
];

export const treemapResolvers = {
  speed: formatSpeedMin,
};
