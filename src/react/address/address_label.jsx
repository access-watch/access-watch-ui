import React from 'react';
import PropTypes from 'prop-types';

import { FlagIcon } from 'access-watch-ui-components';

import '../../../scss/address_label.scss';

const AddressLabel = ({ address, ...htmlProps }) => (
  <span {...htmlProps} className="address_label">
    {address.countryCode && (
      <FlagIcon cc={address.countryCode} title={address.country} />
    )}
    {address.hostname || address.value}
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
