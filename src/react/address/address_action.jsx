import React from 'react';
import PropTypes from 'prop-types';

import RulesButton from '../rules/rule_button';
import RulePropTypes from '../rules/rule_prop_types';
import { addressPropType } from '../prop_types';

const ruleName = 'address';

export const AddressAction = ({ address, rule, actionPending }) => (
  <RulesButton
    value={address}
    type={ruleName}
    rule={rule}
    actionPending={actionPending}
  />
);

AddressAction.propTypes = {
  // cf : https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  address: addressPropType.isRequired,
  rule: PropTypes.shape(RulePropTypes),
  actionPending: PropTypes.bool.isRequired,
};

AddressAction.defaultProps = {
  rule: null,
};

export default AddressAction;
