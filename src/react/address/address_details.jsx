import React from 'react';
import PropTypes from 'prop-types';
import omit from 'blacklist';

import { FlagIcon, addressTypeResolver } from 'access-watch-ui-components';

import { formatNumber } from '../../i18n';
import { convertBackendKeys } from '../../utilities/object';
import { timerangeDisplay } from '../../utilities/timerange';

import AbstractSessionDetails, {
  DEFAULT_COLUMNS,
} from '../sessions/abstract_session_details';
import AbstractSessionDetailsRowBlock from '../sessions/abstract_session_details_row_block';
import { routePropType, addressPropType, logsPropType } from '../prop_types';
import { logMapping } from '../../model/obs_addresses';
import { requestEarlierLogs } from '../../utilities/session';

import '../../../scss/sessions/session_details.scss';

import { AddressAction } from './address_action';

import '../../../scss/address_details.scss';

const handleGetEarlierLogs = ({ address }) =>
  requestEarlierLogs({ logMapping, value: address.value });

const AddressDetails = ({ address: addressSession, route, logs, rule }) => {
  const { count, speed } = addressSession;
  const { address } = addressSession;
  const {
    countryCode,
    asNumber,
    networkName,
    value,
    hostname,
    flags,
    // TODO FIXME normally reputation should exist and we can get rid of this default
    reputation = {},
  } = convertBackendKeys(address);
  const icon = countryCode && <FlagIcon cc={countryCode} size="m" />;

  const title = (
    <span className="address-details__title">
      <span className="address-details__title__main" title={value}>
        {value}
      </span>
      <span className="address-details__title__sub" title={hostname}>
        {hostname}
      </span>
    </span>
  );

  return (
    <AbstractSessionDetails
      title={title}
      icon={icon}
      description=""
      moreButton={{
        text: 'More about this address in Access Watch database',
        url: `https://access.watch/database/addresses/${address.value}`,
        status: reputation.status || '',
      }}
      logsColumns={{
        time: DEFAULT_COLUMNS.time,
        identity: 'Identity',
        ...omit(
          DEFAULT_COLUMNS,
          'time',
          'address.label',
          'user_agent.agent.label'
        ),
      }}
      handleGetEarlierLogs={handleGetEarlierLogs(addressSession)}
      headerRowChildren={[
        <AbstractSessionDetailsRowBlock key="asNumber" label="AS Number">
          {asNumber || ''}
        </AbstractSessionDetailsRowBlock>,
        <AbstractSessionDetailsRowBlock key="networkName" label="Network Name">
          {networkName || ''}
        </AbstractSessionDetailsRowBlock>,
        <AbstractSessionDetailsRowBlock key="type" label="Type">
          {addressTypeResolver({ flags })}
        </AbstractSessionDetailsRowBlock>,
        <AbstractSessionDetailsRowBlock
          key="requestsCount"
          label={`Requests last ${timerangeDisplay(route, 'session')}`}
        >
          {formatNumber(count)}
        </AbstractSessionDetailsRowBlock>,
        <AbstractSessionDetailsRowBlock key="speed" label="Current Speed">
          {formatNumber(speed, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          / min
        </AbstractSessionDetailsRowBlock>,
      ]}
      actionChildren={
        <AddressAction
          address={address}
          {...(rule.id ? { rule } : {})}
          actionPending={rule.actionPending}
        />
      }
      logs={logs}
      route={route}
    />
  );
};

AddressDetails.propTypes = {
  logs: logsPropType.isRequired,
  route: routePropType.isRequired,
  address: PropTypes.shape({
    address: addressPropType.isRequired,
  }).isRequired,
  rule: PropTypes.shape({
    id: PropTypes.string,
    actionPending: PropTypes.bool,
  }).isRequired,
};

export default AddressDetails;
