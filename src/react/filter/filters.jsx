import React from 'react';
import PropTypes from 'prop-types';

import { dispatch, V_UPDATE_FILTER_GROUP } from '../../event_hub';

import Tabs from './smart_filter_tabs';
import SmartFilter from './smart_filter';

import { availableFilterPropType } from './prop_types';
import { filterGroupsPropType, routePropType } from '../prop_types';

import SaveIconSVG from '!raw-loader!../../../assets/save.svg'; //eslint-disable-line

import '../../../scss/filters.scss';

const saveFilterGroup = ({ route, groupId }) => filter => {
  const { filterGroupId } = route;
  if (filterGroupId !== 'default') {
    dispatch({
      type: V_UPDATE_FILTER_GROUP,
      filterGroup: {
        id: filterGroupId,
        filter,
      },
      groupId,
    });
  }
};

const Filters = ({
  route,
  prefix,
  availableFilters,
  filterGroups,
  groupId,
  children,
}) => (
  <div className="filters">
    <Tabs {...filterGroups} route={route} groupId={groupId} />
    <SmartFilter
      route={route}
      prefix={prefix}
      availableFilters={availableFilters}
      onFilterChange={saveFilterGroup({ route, groupId })}
    >
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
