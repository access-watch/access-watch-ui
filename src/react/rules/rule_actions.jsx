import React from 'react';
import PropTypes from 'prop-types';

import RulePropTypes from './rule_prop_types';
import BlockButton from './block_button';
import WhitelistButton from './whitelist_button';

const RuleActions = ({ showOnlyActive, ...props }) => {
  const { rule } = props;
  const shouldDisplay = type => !showOnlyActive || !rule || rule.type === type;
  return (
    <span>
      {shouldDisplay('blocked') && <BlockButton {...props} />}
      {shouldDisplay('whitelisted') && <WhitelistButton {...props} />}
    </span>
  );
};

RuleActions.propTypes = {
  showOnlyActive: PropTypes.bool,
  rule: PropTypes.shape(RulePropTypes),
};

RuleActions.defaultProps = {
  showOnlyActive: false,
  rule: null,
};

export default RuleActions;
