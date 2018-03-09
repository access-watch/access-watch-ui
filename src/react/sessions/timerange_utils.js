import React from 'react';
import omit from 'blacklist';
import config from '../../app_config';
import { pickKeys } from '../../utilities/object';
import { tableResolvers } from './resolvers';
import { timerangeDisplay, timeDisplay } from '../../utilities/timerange';

export const hasTimerange = route => route.timerangeFrom && route.timerangeTo;
export const canDisplayTimerange = config.session.timerange;
export const isTimerangeDisplay = route =>
  hasTimerange(route) && canDisplayTimerange;
export const pickTimerangeKeys = pickKeys(['timerangeFrom', 'timerangeTo']);

export const getTimerangeTableResolvers = route =>
  isTimerangeDisplay(route)
    ? [
        {
          id: 'count',
          sortable: true,
          label: `Count (${timerangeDisplay(route, ['d'])})`,
          // eslint-disable-next-line react/prop-types
          resolver: ({ count, ...props }) => (
            <div className="activity-count__table-cell">
              {count}
              {tableResolvers
                .find(({ id }) => id === 'speed')
                .resolver(omit(props, 'speed'))}
            </div>
          ),
        },
      ]
    : tableResolvers;

export const getTimeDisplay = route =>
  isTimerangeDisplay(route)
    ? timeDisplay(pickTimerangeKeys(route), 'session')
    : timeDisplay({}, 'session');
