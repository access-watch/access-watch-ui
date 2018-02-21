import React from 'react';
import Col from 'elemental/lib/components/Col';
import Row from 'elemental/lib/components/Row';
import { filters } from 'access-watch-sdk';

import {
  tableResolvers,
  treemapResolvers,
  reputationResolver,
} from '../address/address_resolvers';
import {
  getTimerangeTableResolvers,
  getTimeDisplay,
} from '../sessions/timerange_utils';

import SessionTimeSelector from '../sessions/session_time_selector';
import Sessions from '../sessions/sessions';
import SessionsFilter from '../sessions/sessions_filter';
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

const AddressesPage = ({ route, addresses, activity }) => (
  <div className="addresses-page page--sessions">
    <div className="page-header page-header--addresses">
      <div className="page-header__header">
        <Row gutter={0}>
          <Col md="50%">
            <span className="page-header__header-title">
              Top Addresses {` (${getTimeDisplay(route, 'session')})`}
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
        <SessionsFilter
          route={route}
          prefix="address"
          availableFilters={filters.address}
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
