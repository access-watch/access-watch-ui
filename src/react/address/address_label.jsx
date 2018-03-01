import React from 'react';
import PropTypes from 'prop-types';

import { FlagIcon } from 'access-watch-ui-components';

import '../../../scss/address_label.scss';

const addressLabel = ({ hostname, value }) => hostname || value;

const AddressLabel = ({ address, ...htmlProps }) => (
  <span {...htmlProps} className="address_label" title={addressLabel(address)}>
    {address.countryCode && (
      <FlagIcon cc={address.countryCode} title={address.country} />
    )}
    {addressLabel(address)}
  </span>
);

AddressLabel.propTypes = {
  address: PropTypes.shape({
    countryCode: PropTypes.string,
    country: PropTypes.string,
    hostname: PropTypes.string,
    value: PropTypes.string.isRequired,
  }).isRequired,
};

export default AddressLabel;
