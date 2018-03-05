import React from 'react';
import PropTypes from 'prop-types';

import { Loader } from 'access-watch-ui-components';

import TimeAgo from '../utilities/time_ago';
import RuleButton from '../rules/rule_button';
import { formatNumber } from '../../i18n';
import { getIn } from '../../utilities/object';
import AbstractSessionDetails from './abstract_session_details';
import AbstractSessionDetailsRowBlock from './abstract_session_details_row_block';
import IdentityIcon from './identity_icon';
import { logPropType, routePropType } from '../prop_types';
import { getLogMapping } from '../../model/session_details';
import { requestEarlierLogs } from '../../utilities/session';

import '../../../scss/sessions/session_details.scss';

const handleGetEarlierLogs = session => {
  const logMapping = getLogMapping(session);
  const value = getIn(session, getLogMapping(session).split('.'));
  console.log(session);
  return requestEarlierLogs({ logMapping, value });
};

const SessionDetails = ({
  logs,
  route,
  muteParentEsc,
  requestInfo,
  session: realSession,
  rule,
}) => {
  let session = { ...realSession };
  const loading = !session;

  if (session.type === 'identity') {
    if (logs.logs.length) {
      [session] = logs.logs;
      session.count = logs.logs.length;
      session.updated = logs.logs[0].request.time;
    } else {
      // FIXME In case of an old human session, this loading might be forever
      return (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Loader />
        </div>
      );
    }
  }

  const {
    robot,
    identity,
    user_agent: ua,
    updated,
    count,
    speed,
    reputation,
  } = session;

  let title;
  if (robot && robot.name) {
    title = robot.name;
  } else if (ua && ua.agent && ua.agent.label) {
    title = ua.agent.label;
  }

  let moreButton;
  if (robot && robot.id) {
    moreButton = {
      text: 'More about this robot in Access Watch database',
      url: robot.url,
      status: robot.reputation.status,
    };
  }

  const description =
    (robot && robot.description) || (identity && identity.description);

  return (
    <AbstractSessionDetails
      title={title}
      icon={
        <IdentityIcon robot={robot} reputation={reputation} user_agent={ua} />
      }
      moreButton={moreButton}
      description={description}
      requestInfo={requestInfo}
      handleGetEarlierLogs={handleGetEarlierLogs(session)}
      headerRowChildren={[
        <AbstractSessionDetailsRowBlock
          key="agentType"
          modifier="agent-type"
          label="Agent Type"
          value={identity.label}
        >
          {identity.label}
        </AbstractSessionDetailsRowBlock>,
        <AbstractSessionDetailsRowBlock
          key="requestsCount"
          label="Requests Today"
        >
          {formatNumber(count)}
        </AbstractSessionDetailsRowBlock>,
        <AbstractSessionDetailsRowBlock
          key="speed"
          label={speed ? 'Current Speed' : 'Latest Requests'}
          value={formatNumber(count)}
        >
          {speed && (
            <span>
              {formatNumber(speed, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              / min
            </span>
          )}
          {!speed && <TimeAgo time={new Date(updated)} />}
        </AbstractSessionDetailsRowBlock>,
      ]}
      actionChildren={
        !loading &&
        robot && (
          <RuleButton
            value={robot}
            type="robot"
            {...(rule.id ? { rule } : {})}
            actionPending={rule.actionPending}
          />
        )
      }
      logs={logs}
      route={route}
      muteParentEsc={muteParentEsc}
    />
  );
};

SessionDetails.propTypes = {
  session: PropTypes.shape({
    id: PropTypes.string,
    actionables: PropTypes.array,
    actionPending: PropTypes.bool,
    country: PropTypes.string,
    count: PropTypes.number,
    speed: PropTypes.number,
    robot: PropTypes.object,
    reputation: PropTypes.object,
    identity: PropTypes.object,
  }).isRequired,

  logs: PropTypes.shape({
    logs: PropTypes.array,
    loading: PropTypes.bool,
  }).isRequired,
  requestInfo: logPropType,
  route: routePropType.isRequired,
  muteParentEsc: PropTypes.func,
  rule: PropTypes.shape({
    id: PropTypes.string,
    actionPending: PropTypes.bool,
  }),
};

SessionDetails.defaultProps = {
  requestInfo: null,
  muteParentEsc: _ => _,
  rule: null,
};
export default SessionDetails;
