import React from 'react';
import PropTypes from 'prop-types';

import AddressLabel from '../address/address_label';

const conditionDisplays = {
  address: c => <AddressLabel address={c.address} />,
  robot: c => c.robot.name,
};

const ConditionDisplay = ({ condition }) => {
  const conditionDisplay = conditionDisplays[condition.type];
  if (conditionDisplay) {
    return conditionDisplay(condition);
  }
  // eslint-disable-next-line
  console.warn('Warning: cannot find display for condition type ' + type);
  return '';
};

ConditionDisplay.propTypes = {
  condition: PropTypes.shape({
    type: PropTypes.string.isRequired,
  }).isRequired,
};

export default ConditionDisplay;
