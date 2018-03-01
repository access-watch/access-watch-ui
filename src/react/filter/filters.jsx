import React from 'react';
import PropTypes from 'prop-types';

import { dispatch, V_UPDATE_SEARCH } from '../../event_hub';

import Tabs from './smart_filter_tabs';
import SmartFilter from './smart_filter';

import { availableFilterPropType } from './prop_types';
import { searchesPropType, routePropType } from '../prop_types';

import SaveIconSVG from '!raw-loader!../../../assets/save.svg'; //eslint-disable-line

import '../../../scss/filters.scss';

const saveSearch = ({ route, groupId }) => filter => {
  const { searchId } = route;
  if (searchId !== 'default') {
    dispatch({
      type: V_UPDATE_SEARCH,
      search: {
        id: searchId,
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
  searches,
  groupId,
  children,
}) => (
  <div className="filters">
    <Tabs {...searches} route={route} groupId={groupId} />
    <SmartFilter
      route={route}
      prefix={prefix}
      availableFilters={availableFilters}
      onFilterChange={saveSearch({ route, groupId })}
    >
      {children}
    </SmartFilter>
  </div>
);

Filters.propTypes = {
  route: routePropType.isRequired,
  prefix: PropTypes.string.isRequired,
  searches: searchesPropType.isRequired,
  availableFilters: PropTypes.arrayOf(availableFilterPropType).isRequired,
  groupId: PropTypes.string.isRequired,
  children: PropTypes.node,
};

Filters.defaultProps = {
  children: null,
};

export default Filters;
