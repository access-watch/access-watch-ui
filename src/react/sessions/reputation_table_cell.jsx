import React from 'react';
import PropTypes from 'prop-types';

import { capitalize } from '../../utilities/string';

import '../../../scss/sessions/reputation_table_cell.scss';

// TODO FIXME: normally we should be able to expect reputation to be set so no need for default

const ReputationTableCell = ({ reputation: { status = '' } }) => (
  <span className={`reputation-table-cell reputation-table-cell--${status}`}>
    {capitalize(status)}
  </span>
);

ReputationTableCell.propTypes = {
  reputation: PropTypes.shape({
    status: PropTypes.string,
  }).isRequired,
};

export default ReputationTableCell;
