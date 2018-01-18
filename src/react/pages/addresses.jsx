import React from 'react';
import Col from 'elemental/lib/components/Col';
import Row from 'elemental/lib/components/Row';

import { timeDisplay } from '../../utilities/timerange';
import {
  tableResolvers,
  treemapResolvers,
  reputationResolver,
} from '../address/address_resolvers';

import SessionToolbar from '../sessions/session_toolbar';
import Sessions from '../sessions/sessions';
import { routePropType, addressSessionsPropType } from '../prop_types';

import '../../../scss/sessions/sessions_page.scss';
import '../../../scss/addresses_page.scss';

const rowClassResolver = address => {
  const { status } = reputationResolver(address);
  return status ? `addresses__table__row--${status}` : '';
};

const AddressesPage = ({ route, addresses }) => (
  <div className="addresses-page page--sessions">
    <div className="page-header page-header--addresses">
      <div className="page-header__header">
        <Row gutter={0}>
          <Col md="50%">
            <span className="page-header__header-title">
              Top Addresses {`(${timeDisplay()})`}
            </span>
          </Col>
        </Row>
      </div>
      <SessionToolbar route={route} />
    </div>
    <Sessions
      sessions={addresses}
      tableResolvers={tableResolvers}
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
};
/* eslint-enable react/no-typos */

export default AddressesPage;
