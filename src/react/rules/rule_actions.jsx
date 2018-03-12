import React from 'react';
import PropTypes from 'prop-types';

import RulePropTypes from './rule_prop_types';
import BlockButton from './block_button';
import WhitelistButton from './whitelist_button';

const RuleActions = props => {
  const { rule } = props;
  const shouldDisplay = type => !rule || rule.type === type;
  return (
    <span>
      {shouldDisplay('blocked') && <BlockButton {...props} />}
      {shouldDisplay('whitelisted') && <WhitelistButton {...props} />}
    </span>
  );
};

RuleActions.propTypes = {
  rule: PropTypes.shape(RulePropTypes),
};

RuleActions.defaultProps = {
  rule: null,
};

export default RuleActions;
