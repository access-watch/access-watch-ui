import React from 'react';
import cx from 'classnames';

import { formatNumber, formatSpeedMin } from '../../i18n';
import { capitalize } from '../../utilities/string';
import ActivityCell from '../activity/activity_cell';
import RuleActions from '../rules/rule_actions';

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
    id: 'speed',
    label: 'Activity (last 15m)',
    resolver: ActivityCell,
    sortable: true,
  },
  {
    id: 'rule',
    // eslint-disable-next-line
    resolver: ({ rule, type, ...session }) => (
      <RuleActions
        activeText={({ ruleType }) => capitalize(ruleType)}
        condition={{ type, value: session[type] }}
        rule={rule}
      />
    ),
  },
];

export const treemapResolvers = {
  speed: formatSpeedMin,
};
