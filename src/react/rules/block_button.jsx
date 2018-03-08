import React from 'react';

import RuleButton from './rule_button';

import blockedIcon from '!raw-loader!../../../assets/blocked-nofill.svg'; // eslint-disable-line

const BlockButton = props => (
  <RuleButton
    type="blocked"
    icon={blockedIcon}
    activeButtonText="Block"
    {...props}
  />
);

export default BlockButton;
