import React from 'react';

import BlockButton from './block_button';
import WhitelistButton from './whitelist_button';

const RuleActions = ({ ...buttonProps }) => (
  <span>
    <BlockButton {...buttonProps} />
    <WhitelistButton {...buttonProps} />
  </span>
);

export default RuleActions;
