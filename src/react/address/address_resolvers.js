import React from 'react';

import { FlagIcon, countries, addressTypeResolver } from 'access-watch-ui-components';

import {
  tableResolvers as sessionTableResolvers,
  createReputationPreviewResolver,
} from '../sessions/resolvers';

import IdentityTableCell from '../sessions/identity_table_cell';
import ReputationTableCell from '../sessions/reputation_table_cell';

export { addressTypeResolver } from 'access-watch-ui-components';

const inAddress = k => o => o.address[k] || '';

// eslint-disable-next-line
const countryFlagResolver = size => ({ address }) => {
  const { country_code: countryCode } = address;
  if (countryCode) {
    const country = countries[countryCode] && countries[countryCode].name;
    return <FlagIcon cc={address.country_code} title={country} size={size} />;
  }
  return null;
};

// eslint-disable-next-line
export const countryResolver = ({ address }) => {
  const { country_code: countryCode } = address;
  if (countryCode) {
    const country = countries[countryCode] && countries[countryCode].name;
    return (
      <span>
        <FlagIcon cc={address.country_code} title={country} />
        {country}
      </span>
    );
  }
  return '';
};

export const valueResolver = o => inAddress('value')(o);
export const hostnameResolver = o => inAddress('hostname')(o);
// TODO FIXME: normally we should be able to expect reputation to be set so no need for default
export const reputationResolver = ({ address: { reputation = {} } }) =>
  reputation;

export const typeResolver = ({ address }) => addressTypeResolver(address);

export const treemapResolvers = {
  icon: countryFlagResolver('m'),
  title: valueResolver,
  country: hostnameResolver,
  type: typeResolver,
  reputation: reputationResolver,
};

export const tableResolvers = [
  createReputationPreviewResolver(reputationResolver),
  {
    id: 'address',
    resolver: o => hostnameResolver(o) || valueResolver(o),
  },
  {
    id: 'asNumber',
    label: 'AS Number',
    resolver: inAddress('as_number'),
  },
  {
    id: 'networkName',
    label: 'Network name',
    resolver: inAddress('network_name'),
  },
  {
    id: 'country',
    resolver: entry => {
      const countryComponent = countryResolver(entry);
      if (typeof countryComponent === 'object') {
        React.cloneElement(countryComponent, {
          className: 'addresses-table__flag-icon',
        });
      }
      return countryComponent;
    },
  },
  {
    id: 'type',
    resolver: typeResolver,
  },
  {
    id: 'reputation',
    resolver: o => <ReputationTableCell reputation={reputationResolver(o)} />,
  },
  {
    id: 'identity',
    // eslint-disable-next-line
    resolver: ({ robots = {}, user_agents: uas = {}, ...address }) => {
      const robotsIds = Object.keys(robots);
      if (robotsIds.length > 1) {
        return 'Multiple Robots';
      }
      if (robotsIds.length === 1) {
        const robot = robots[robotsIds[0]];
        return (
          <IdentityTableCell robot={robot} reputation={robot.reputation} />
        );
      }
      const uaIds = Object.keys(uas);
      if (uaIds.length > 1) {
        const robotUas = Object.values(uas).filter(
          ({ type }) => type === 'robot'
        );
        if (robotUas.length === uaIds.length) {
          return 'Multiple Robots';
        }
        if (robotUas.length === 0) {
          return 'Multiple Browsers';
        }
        return 'Multiple agents';
      }
      if (uaIds.length === 1) {
        return (
          <IdentityTableCell
            reputation={reputationResolver(address)}
            user_agent={uas[uaIds[0]]}
          />
        );
      }
      return '';
    },
  },
  ...sessionTableResolvers,
];
