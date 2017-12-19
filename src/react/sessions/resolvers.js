import React from 'react';
import cx from 'classnames';

import { formatNumber, formatSpeedMin } from '../../i18n';
import ActivitySparkLine from '../activity/activity_spark_line';

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
    resolver: ActivitySparkLine,
  },
  {
    id: 'speed',
    label: 'Speed',
    resolver: formatSpeedMin,
    sortable: true,
  },
];

export const treemapResolvers = {
  speed: formatSpeedMin,
};
