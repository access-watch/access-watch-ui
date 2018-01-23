import React from 'react';
import PropTypes from 'prop-types';
import Col from 'elemental/lib/components/Col';
import Row from 'elemental/lib/components/Row';
import { countries } from 'access-watch-ui-components';

import { timeDisplay } from '../../utilities/timerange';
import {
  tableResolvers as sessionTableResolvers,
  createReputationPreviewResolver,
} from '../sessions/resolvers';

import Sessions from '../sessions/sessions';
import SessionToolbar from '../sessions/session_toolbar';
import IdentityTableCell from '../sessions/identity_table_cell';
import ReputationTableCell from '../sessions/reputation_table_cell';
import IdentityIcon from '../sessions/identity_icon';
import { robotSessionsPropType } from '../prop_types';

import '../../../scss/robots_page.scss';
import '../../../scss/sessions/sessions_page.scss';

export const iconResolver = session => <IdentityIcon {...session} />;

const treemapResolvers = {
  icon: s =>
    React.cloneElement(iconResolver(s), {
      className: 'session-block__icon inline',
    }),
  title: ({ robot, user_agent: ua }) => {
    if (robot && robot.name) {
      return robot.name;
    }
    if (ua && ua.agent && ua.agent.label) {
      return ua.agent.label;
    }
    return '-';
  },
  country: ({ country_code: countryCode }) =>
    countryCode && countries[countryCode],
  type: session => session.robot.label,
  reputation: ({ reputation }) => reputation,
};

const tableResolvers = [
  createReputationPreviewResolver(treemapResolvers.reputation),
  {
    id: 'robot',
    // eslint-disable-next-line
    resolver: ({ robot }) => (
      <IdentityTableCell robot={robot} reputation={robot.reputation} />
    ),
  },
  {
    id: 'type',
    resolver: treemapResolvers.type,
  },
  {
    id: 'reputation',
    resolver: session => (
      <ReputationTableCell reputation={treemapResolvers.reputation(session)} />
    ),
  },
  ...sessionTableResolvers,
];

const rowClassResolver = robot => {
  const { status } = treemapResolvers.reputation(robot);
  return status ? `robots__table__row--${status}` : '';
};

const RobotsPage = ({ route, robots }) => (
  <div className="robots-page page--sessions">
    <div className="page-header page-header--robots">
      <div className="page-header__header">
        <Row gutter={0}>
          <Col md="50%">
            <span className="page-header__header-title">
              Top Robots {`(${timeDisplay()})`}
            </span>
          </Col>
          <Col md="50%" style={{ alignItems: 'center' }}>
            <SessionToolbar route={route} />
          </Col>
        </Row>
      </div>
    </div>
    <Sessions
      sessions={robots}
      tableResolvers={tableResolvers}
      route={route}
      treemapResolvers={treemapResolvers}
      emptyMessage="No robots seen for this period"
      loading={false}
      rowClassResolver={rowClassResolver}
    />
  </div>
);

RobotsPage.propTypes = {
  route: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool])
  ).isRequired,
  // cf : https://github.com/yannickcr/eslint-plugin-react/issues/1389
  /* eslint-disable react/no-typos */
  robots: robotSessionsPropType.isRequired,
  /* eslint-enable react/no-typos */
};

export default RobotsPage;
