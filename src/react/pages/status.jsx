import React from 'react';
import PropTypes from 'prop-types';

import { Loader } from 'access-watch-ui-components';

import createSpeedResolvers from '../activity/speed_resolver';
import RoundedTable from '../table/rounded_table';
import { speedPropType } from '../prop_types';

import '../../../scss/status_page.scss';

const statusResolvers = [
  {
    id: 'name',
  },
  ...createSpeedResolvers({ id: 'accepted' }),
  ...createSpeedResolvers({ id: 'rejected' }),
  {
    id: 'status',
  },
];

const renderStatusData = (title, entries, resolvers = statusResolvers) => (
  <div className="status__section">
    <div className="status__section__title">{title}</div>
    <RoundedTable
      entries={entries.map((e, id) => ({ ...e, id }))}
      resolvers={resolvers}
    />
  </div>
);

const StatusPage = ({ status, statusLoading }) => (
  <div className="status">
    {statusLoading && <Loader />}
    {renderStatusData('Input', status)}
  </div>
);

StatusPage.propTypes = {
  status: PropTypes.arrayOf(
    PropTypes.shape({
      accepted: speedPropType.isRequired,
      name: PropTypes.string.isRequired,
      rejected: speedPropType.isRequired,
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
  statusLoading: PropTypes.bool,
};

StatusPage.defaultProps = {
  statusLoading: false,
};

export default StatusPage;
