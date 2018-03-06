import React from 'react';
import PropTypes from 'prop-types';

import { SmartFilter as SmartFilterAbstract } from 'access-watch-ui-components';

import { routePropType } from '../prop_types';
import { updateRouteParameter } from '../../utilities/route_utils';
import { URIToFilters, filtersToURI } from '../../utilities/filter';
import { V_SET_ROUTE, dispatch } from '../../event_hub';
import FilterHelper from './filter_helper';

import '../../../scss/smart_filter.scss';

const getFilterFunctions = ({ route }) => {
  const dispatchNewFilters = filters =>
    new Promise(resolve => {
      const value = filtersToURI(filters);
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

  const updateFilter = ({ id, updateFn }) =>
    URIToFilters(route.filter).reduce(
      (newFilters, f) => [...newFilters, f.id === id ? updateFn(f) : f],
      []
    );

  const onDeleteFilterValue = ({ id, value }) =>
    dispatchNewFilters(
      updateFilter({
        id,
        updateFn: f => ({
          ...f,
          values: f.values.filter(val => value !== val),
        }),
      })
    );

  const onFilterValueChange = ({ id, newValue, oldValue }) =>
    dispatchNewFilters(
      updateFilter({
        id,
        updateFn: f => ({
          ...f,
          values: oldValue
            ? f.values.map(value => (oldValue === value ? newValue : value))
            : [...(f.values || []), newValue],
        }),
      })
    );

  const onAddFilter = filter =>
    dispatchNewFilters(URIToFilters(route.filter).concat([filter]));

  const onInvertFilter = ({ id }) =>
    dispatchNewFilters(
      updateFilter({ id, updateFn: f => ({ ...f, negative: !f.negative }) })
    );

  return {
    onDeleteFilter,
    onDeleteFilterValue,
    onFilterValueChange,
    onAddFilter,
    onInvertFilter,
    URIToFilters,
  };
};

class SmartFilter extends React.Component {
  static propTypes = {
    route: routePropType.isRequired,
    children: PropTypes.node,
    onFilterChange: PropTypes.func,
  };

  static defaultProps = {
    children: null,
    onFilterChange: _ => _,
  };

  state = {};

  onFilterValueChange = args => {
    const { id, newValue: newValueRaw } = args;
    const { newFilter } = this.state;
    const { onFilterValueChange } = this.getFilterFunctions();
    const newValue = newValueRaw.trim();
    if (newFilter === id) {
      this.setState({ newFilter: null });
    }
    onFilterValueChange({ ...args, newValue });
  };

  onAddFilter = ({ id }) => {
    const { onAddFilter } = this.getFilterFunctions();
    this.setState({ newFilter: id });
    onAddFilter({ id });
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
    const filters = URIToFilters(route.filter);
    if (!filters.find(f => f.id === id)) {
      this.onAddFilter({ id });
    }
  };

  onInvertFilter = ({ id }) => {
    const { onInvertFilter } = this.getFilterFunctions();
    onInvertFilter({ id });
  };

  getFilterFunctions = () => {
    const { route, onFilterChange } = this.props;
    const origFilterFns = getFilterFunctions({
      route,
    });
    const shouldCallOnFilterChange = key =>
      [
        'onDeleteFilter',
        'onDeleteFilterValue',
        'onFilterValueChange',
        'onAddFilter',
        'onInvertFilter',
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
    const filtersFn = this.getFilterFunctions();
    const { filter = '' } = route;
    const filters = URIToFilters(filter);
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
          onInvertFilter={this.onInvertFilter}
          {...props}
        />
        <div className="smart-filter__children">{children}</div>
      </div>
    );
  }
}

export default SmartFilter;
