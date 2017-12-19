import React from 'react';

import IdentityIcon, {
  IdentityPropTypes,
  IdentityDefaultProps,
  getIdentityLabel,
} from './identity_icon';

import '../../../scss/sessions/identity_table_cell.scss';

const baseClassName = 'aw-table__identity-cell';
const iconClassName = `${baseClassName}__icon`;

const IdentityTableCell = ({ robot, reputation, user_agent: ua }) => (
  <span className={baseClassName}>
    <IdentityIcon
      robot={robot}
      reputation={reputation}
      user_agent={ua}
      className={iconClassName}
    />
    {getIdentityLabel({ robot, ua })}
  </span>
);

IdentityTableCell.propTypes = IdentityPropTypes;

IdentityTableCell.defaultProps = IdentityDefaultProps;

export default IdentityTableCell;
