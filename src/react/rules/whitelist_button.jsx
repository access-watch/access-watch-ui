import React from 'react';

import RuleButton from './rule_button';

import whitelistIcon from '!raw-loader!../../../assets/verified-white.svg'; // eslint-disable-line

const WhitelistButton = props => (
  <RuleButton
    type="whitelisted"
    icon={whitelistIcon}
    activeButtonText="Whitelist"
    {...props}
  />
);

export default WhitelistButton;
