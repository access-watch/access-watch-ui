import React from 'react';
import PropTypes from 'prop-types';

import { SmartFilter as SmartFilterAbstract } from 'access-watch-ui-components';

import { routePropType } from '../prop_types';
import { updateRouteParameter } from '../../utilities/route_utils';
import { V_SET_ROUTE, dispatch } from '../../event_hub';

import '../../../scss/smart_filter.scss';

const prefixFilter = prefix => ({ id, ...rest }) => ({
  id: prefix ? `${prefix}.${id}` : id,
  ...rest,
});
const unfixFilter = prefix => ({ id, ...rest }) => ({
  id: id.replace(`${prefix}.`, ''),
  ...rest,
});

const filterToURI = ({ id, values = [] }) => `${id}:${values.join(',')}`;
const filtersToURI = filters => filters.map(filterToURI).join(';');
const URIToFilter = uri => {
  const [id, valuesURI] = uri.split(':');
  const values = valuesURI ? valuesURI.split(',') : [];
  return {
    id,
    values,
  };
};
const createURIToFilters = prefix => uri =>
  uri.length
    ? uri.split(';').map(f => unfixFilter(prefix)(URIToFilter(f)))
    : [];

const getFilterFunctions = ({ route, prefix }) => {
  const URIToFilters = createURIToFilters(prefix);
  const dispatchNewFilters = filters =>
    dispatch({
      type: V_SET_ROUTE,
      route: updateRouteParameter({
        route: route.route,
        param: 'filter',
        value: filtersToURI(filters.map(prefixFilter(prefix))),
      }),
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

  getFilterFunctions = () => {
    const { route, prefix } = this.props;
    return getFilterFunctions({
      route,
      prefix,
    });
  };

  render() {
    const { route, ...props } = this.props;
    const { newFilter } = this.state;
    const { URIToFilters, ...filtersFn } = this.getFilterFunctions();
    const filters = newFilter
      ? [...URIToFilters(route.filter), { id: newFilter }]
      : URIToFilters(route.filter);
    return (
      <SmartFilterAbstract
        filters={filters}
        {...filtersFn}
        onAddFilter={this.onAddFilter}
        onFilterValueChange={this.onFilterValueChange}
        onDeleteFilter={this.onDeleteFilter}
        {...props}
      />
    );
  }
}

export default SmartFilter;
