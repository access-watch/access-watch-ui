import React from 'react';
import PropTypes from 'prop-types';

import { SmartFilter as SmartFilterAbstract } from 'access-watch-ui-components';

import { routePropType } from '../prop_types';
import { updateRouteParameter } from '../../utilities/route_utils';
import {
  createURIToFilters,
  filtersToURI,
  prefixFilter,
} from '../../utilities/filter';
import { V_SET_ROUTE, dispatch } from '../../event_hub';
import FilterHelper from './filter_helper';

import '../../../scss/smart_filter.scss';

const getFilterFunctions = ({ route, prefix }) => {
  const URIToFilters = createURIToFilters(prefix);
  const dispatchNewFilters = filters =>
    new Promise(resolve => {
      const value = filtersToURI(filters.map(prefixFilter(prefix)));
      dispatch({
        type: V_SET_ROUTE,
        route: updateRouteParameter({
          route: route.route,
          param: 'filter',
          value,
        }),
      });
      resolve(value);
    });

  const onDeleteFilter = ({ id }) =>
    dispatchNewFilters(URIToFilters(route.filter).filter(f => f.id !== id));

  const onDeleteFilterValue = ({ id, value }) =>
    dispatchNewFilters(
      URIToFilters(route.filter).reduce(
        (newFilters, f) => [
          ...newFilters,
          f.id === id
            ? {
                ...f,
                values: f.values.filter(val => value !== val),
              }
            : f,
        ],
        []
      )
    );

  const onFilterValueChange = ({ id, newValue, oldValue }) =>
    dispatchNewFilters(
      URIToFilters(route.filter).reduce(
        (newFilters, f) => [
          ...newFilters,
          f.id === id
            ? {
                ...f,
                values: oldValue
                  ? f.values.map(
                      value => (oldValue === value ? newValue : value)
                    )
                  : f.values.concat([newValue]),
              }
            : f,
        ],
        []
      )
    );

  const onAddFilter = filter =>
    dispatchNewFilters(URIToFilters(route.filter).concat([filter]));

  return {
    onDeleteFilter,
    onDeleteFilterValue,
    onFilterValueChange,
    onAddFilter,
    URIToFilters,
  };
};

class SmartFilter extends React.Component {
  static propTypes = {
    route: routePropType.isRequired,
    prefix: PropTypes.string.isRequired,
    children: PropTypes.node,
    onFilterChange: PropTypes.func,
  };

  static defaultProps = {
    children: null,
    onFilterChange: _ => _,
  };

  state = {};

  onFilterValueChange = args => {
    const { id, newValue } = args;
    const { newFilter } = this.state;
    const { onAddFilter, onFilterValueChange } = this.getFilterFunctions();
    if (newFilter === id) {
      onAddFilter({ id, values: [newValue] });
      this.setState({ newFilter: null });
    } else {
      onFilterValueChange(args);
    }
  };

  onAddFilter = ({ id }) => {
    this.setState({ newFilter: id });
  };

  onDeleteFilter = ({ id }) => {
    const { newFilter } = this.state;
    if (newFilter === id) {
      this.setState({ newFilter: null });
    } else {
      this.getFilterFunctions().onDeleteFilter({ id });
    }
  };

  onFilterValueClick = ({ id, value }) => {
    const { route } = this.props;
    const {
      URIToFilters,
      onDeleteFilterValue,
      onAddFilter,
      onFilterValueChange,
    } = this.getFilterFunctions();
    const filters = URIToFilters(route.filter);
    const filter = filters.find(f => f.id === id);
    if (filter) {
      const { values = [] } = filter;
      if (values.indexOf(value) !== -1) {
        onDeleteFilterValue({ id, value });
      } else {
        onFilterValueChange({ id, newValue: value });
      }
    } else {
      onAddFilter({ id, values: [value] });
    }
  };

  onFilterClick = ({ id }) => {
    const { route } = this.props;
    const { URIToFilters } = this.getFilterFunctions();
    const filters = URIToFilters(route.filter);
    if (!filters.find(f => f.id === id)) {
      this.onAddFilter({ id });
    }
  };

  getFilterFunctions = () => {
    const { route, prefix, onFilterChange } = this.props;
    const origFilterFns = getFilterFunctions({
      route,
      prefix,
    });
    const shouldCallOnFilterChange = key =>
      [
        'onDeleteFilter',
        'onDeleteFilterValue',
        'onFilterValueChange',
        'onAddFilter',
      ].indexOf(key) !== -1;
    return Object.keys(origFilterFns).reduce((filterFns, key) => {
      let fn = origFilterFns[key];
      if (shouldCallOnFilterChange(key)) {
        fn = (...args) => origFilterFns[key](...args).then(onFilterChange);
      }
      return { ...filterFns, [key]: fn };
    }, {});
  };

  handleUnselectFilter = () => {
    this.setState({ newFilter: null });
  };

  render() {
    const { route, children, ...props } = this.props;
    const { newFilter } = this.state;
    const { URIToFilters, ...filtersFn } = this.getFilterFunctions();
    const { filter = '' } = route;
    const filters = newFilter
      ? [...URIToFilters(filter), { id: newFilter }]
      : URIToFilters(filter);
    return (
      <div className="smart-filter__wrapper">
        <FilterHelper
          filters={filters}
          availableFilters={props.availableFilters}
          onFilterClick={this.onFilterClick}
          onFilterValueClick={this.onFilterValueClick}
        />
        <SmartFilterAbstract
          filters={filters}
          {...filtersFn}
          onAddFilter={this.onAddFilter}
          onFilterValueChange={this.onFilterValueChange}
          onDeleteFilter={this.onDeleteFilter}
          selectedFilter={newFilter}
          onUnselectFilter={this.handleUnselectFilter}
          {...props}
        />
        <div className="smart-filter__children">{children}</div>
      </div>
    );
  }
}

export default SmartFilter;
