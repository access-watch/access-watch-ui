import React from 'react';
import PropTypes from 'prop-types';

import { Loader } from 'access-watch-ui-components';

import createSpeedResolvers from '../activity/speed_resolver';
import RoundedTable from '../table/rounded_table';
import { speedPropType } from '../prop_types';
import config from '../../app_config';

import '../../../scss/status_page.scss';

const interpolateStatusString = str =>
  str.replace('#API_WEBSOCKET_URL#', config.websocket);

const createSpeedsResolvers = speedIds =>
  speedIds.reduce(
    (arr, speedId) => [
      ...arr,
      ...createSpeedResolvers({ id: speedId }).map(({ resolver, ...rest }) => ({
        ...rest,
        resolver: ({ id, speeds }) => resolver({ id, ...speeds }),
      })),
    ],
    []
  );

const createStatusResolvers = speedsResolvers => [
  {
    id: 'name',
  },
  ...speedsResolvers,
  {
    id: 'status',
    resolver: ({ status }) => interpolateStatusString(status),
  },
];

const inputResolvers = createStatusResolvers(
  createSpeedsResolvers(['accepted', 'rejected'])
);

const outputResolvers = createStatusResolvers(
  createSpeedsResolvers(['processed'])
);

const renderStatusData = (title, entries, resolvers) => (
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
    {renderStatusData(
      'Input',
      status.filter(({ type }) => type === 'input'),
      inputResolvers
    )}
    {renderStatusData(
      'Output',
      status.filter(({ type }) => type === 'output'),
      outputResolvers
    )}
  </div>
);

StatusPage.propTypes = {
  status: PropTypes.arrayOf(
    PropTypes.shape({
      speeds: PropTypes.objectOf(speedPropType).isRequired,
      name: PropTypes.string.isRequired,
      rejected: speedPropType.isRequired,
    })
  ).isRequired,
  statusLoading: PropTypes.bool,
};

StatusPage.defaultProps = {
  statusLoading: false,
};

export default StatusPage;
