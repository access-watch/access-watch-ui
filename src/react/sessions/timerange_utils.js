import React from 'react';
import omit from 'blacklist';
import {
  hasSessionTimerangeSupport,
  hasElasticSearch,
} from '../../utilities/config';
import { pickKeys } from '../../utilities/object';
import { tableResolvers } from './resolvers';
import { timerangeDisplay, timeDisplay } from '../../utilities/timerange';

export const hasTimerange = route => route.timerangeFrom && route.timerangeTo;
export const isTimerangeDisplay = route =>
  hasTimerange(route) && hasSessionTimerangeSupport();
export const pickTimerangeKeys = pickKeys(['timerangeFrom', 'timerangeTo']);

export const getTimerangeTableResolvers = route =>
  isTimerangeDisplay(route)
    ? tableResolvers.filter(({ id }) => id !== 'speed').map(
        r =>
          r.id === 'count'
            ? {
                id: 'count',
                sortable: true,
                label: `Count (${timerangeDisplay(route, 'session')})`,
                // eslint-disable-next-line react/prop-types
                resolver: ({ count, ...props }) => (
                  <div className="activity-count__table-cell">
                    {count}
                    {tableResolvers
                      .find(({ id }) => id === 'speed')
                      .resolver(omit(props, 'speed'))}
                  </div>
                ),
              }
            : r
      )
    : tableResolvers.map(
        r =>
          r.id === 'count'
            ? {
                ...r,
                label: `Count (${timerangeDisplay(route, 'session')})`,
              }
            : r
      );

export const getTimeDisplay = route =>
  isTimerangeDisplay(route)
    ? timeDisplay(pickTimerangeKeys(route), 'session')
    : timeDisplay(hasElasticSearch() ? route : {}, 'session');
