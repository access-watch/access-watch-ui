import React from 'react';
import Col from 'elemental/lib/components/Col';
import Row from 'elemental/lib/components/Row';
import { SmartFilter } from 'access-watch-ui-components';

import {
  tableResolvers,
  treemapResolvers,
  reputationResolver,
} from '../address/address_resolvers';
import {
  getTimerangeTableResolvers,
  getTimeDisplay,
} from '../sessions/timerange_utils';
import filters from '../address/filters';
import { updateRouteParameter } from '../../utilities/route_utils';
import { V_SET_ROUTE, dispatch } from '../../event_hub';

import SessionTimeSelector from '../sessions/session_time_selector';
import SessionToolbar from '../sessions/session_toolbar';
import Sessions from '../sessions/sessions';
import {
  routePropType,
  addressSessionsPropType,
  activityPropType,
} from '../prop_types';

import '../../../scss/sessions/sessions_page.scss';
import '../../../scss/addresses_page.scss';

const rowClassResolver = address => {
  const { status } = reputationResolver(address);
  return status ? `addresses__table__row--${status}` : '';
};

const dispatchNewFilters = ({ route }, value) =>
  dispatch({
    type: V_SET_ROUTE,
    route: updateRouteParameter({ route, param: 'filters', value }),
  });

const onDeleteFilter = route => ({ id }) =>
  dispatchNewFilters(route, route.filters.filter(f => f.id !== id));

const onDeleteFilterValue = route => ({ id, value }) =>
  dispatchNewFilters(
    route,
    route.filters.reduce((newFilters, f) => {
      const { values = [] } = f;
      return [
        ...newFilters,
        f.id === id
          ? {
              ...f,
              values: values.filter(val => value !== val),
            }
          : f,
      ];
    }, [])
  );

const onFilterValueChange = route => ({ id, newValue, oldValue }) =>
  dispatchNewFilters(
    route,
    route.filters.reduce((newFilters, f) => {
      const { values = [] } = f;
      return [
        ...newFilters,
        f.id === id
          ? {
              ...f,
              values: oldValue
                ? values.map(value => (oldValue === value ? newValue : value))
                : values.concat([newValue]),
            }
          : f,
      ];
    }, [])
  );

const onAddFilter = route => ({ id }) =>
  dispatchNewFilters(route, route.filters.concat([{ id }]));

const AddressesPage = ({ route, addresses, activity }) => (
  <div className="addresses-page page--sessions">
    <div className="page-header page-header--addresses">
      <div className="page-header__header">
        <Row gutter={0}>
          <Col md="50%">
            <span className="page-header__header-title">
              Top Addresses {` (${getTimeDisplay(route)})`}
            </span>
          </Col>
          <Col md="50%">
            <SessionTimeSelector activity={activity} route={route} />
          </Col>
        </Row>
      </div>
      <div
        className="page-header__body"
        style={{ flexDirection: 'column', justifyContent: 'flex-end' }}
      >
        <SessionToolbar route={route} />
        <SmartFilter
          filters={route.filters}
          onDeleteFilter={onDeleteFilter(route)}
          onDeleteFilterValue={onDeleteFilterValue(route)}
          availableFilters={filters}
          onFilterValueChange={onFilterValueChange(route)}
          onAddFilter={onAddFilter(route)}
        />
      </div>
    </div>
    <Sessions
      sessions={addresses}
      tableResolvers={[...tableResolvers, ...getTimerangeTableResolvers(route)]}
      route={route}
      treemapResolvers={treemapResolvers}
      emptyMessage="No addresses seen for this period"
      loading={false}
      rowClassResolver={rowClassResolver}
    />
  </div>
);

// cf : https://github.com/yannickcr/eslint-plugin-react/issues/1389
/* eslint-disable react/no-typos */
AddressesPage.propTypes = {
  route: routePropType.isRequired,
  addresses: addressSessionsPropType.isRequired,
  activity: activityPropType.isRequired,
};
/* eslint-enable react/no-typos */

export default AddressesPage;
