import React from 'react';
import PropTypes from 'prop-types';

import { dispatch, V_SET_ROUTE } from '../../event_hub';
import { updateRouteParameter } from '../../utilities/route_utils';

import Tabs from './smart_filter_tabs';
import SmartFilter from './smart_filter';
import SaveFilterGroup from './save_filter_group';
import SVGIcon from '../utilities/svg_icon';

import { availableFilterPropType } from './prop_types';
import { filterGroupsPropType, routePropType } from '../prop_types';

import SaveIconSVG from '!raw-loader!../../../assets/save.svg'; //eslint-disable-line

import '../../../scss/filters.scss';

const changeRouteToFilterGroupId = route => ({ id }) =>
  dispatch({
    type: V_SET_ROUTE,
    route: updateRouteParameter({
      route: route.route,
      param: 'filterGroupId',
      value: id,
    }),
  });

const Filters = ({
  route,
  prefix,
  availableFilters,
  filterGroups,
  groupId,
  children,
}) => (
  <div className="filters">
    <Tabs filterGroups={filterGroups} route={route} groupId={groupId} />
    <SmartFilter
      route={route}
      prefix={prefix}
      availableFilters={availableFilters}
    >
      <SaveFilterGroup
        filter={route.filter}
        filterGroup={
          route.filterGroupId === 'default'
            ? {}
            : filterGroups.find(fg => fg.id === route.filterGroupId) || {
                id: route.filterGroupId,
              }
        }
        groupId={groupId}
        index={filterGroups.length + 1}
        onAddFilterGroup={changeRouteToFilterGroupId(route)}
      >
        <SVGIcon svg={SaveIconSVG} className="filters-save-icon" />
      </SaveFilterGroup>
      {children}
    </SmartFilter>
  </div>
);

Filters.propTypes = {
  route: routePropType.isRequired,
  prefix: PropTypes.string.isRequired,
  filterGroups: filterGroupsPropType.isRequired,
  availableFilters: PropTypes.arrayOf(availableFilterPropType).isRequired,
  groupId: PropTypes.string.isRequired,
  children: PropTypes.node,
};

Filters.defaultProps = {
  children: null,
};

export default Filters;
