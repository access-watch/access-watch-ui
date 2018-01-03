import React from 'react';
import PropTypes from 'prop-types';

import { identityIcons } from '../../icons/identity';
import { userAgentIcons } from '../../icons/user_agent';

import SVGIcon from '../utilities/svg_icon';

const isBadReputation = ({ status }) =>
  status === 'suspicious' || status === 'bad';
const hasRobotIcon = robot => robot && robot.icon;
const hasUaName = ua => ua && ua.agent && ua.agent.name;

export const getIdentityLabel = ({ robot, ua }) =>
  (robot && robot.name) || (ua && ua.agent && ua.agent.label) || 'Unknown';

const IdentityIcon = ({ robot, reputation, user_agent: ua, className }) => {
  let icon;
  if (!hasRobotIcon(robot) && hasUaName(ua) && !isBadReputation(reputation)) {
    icon = userAgentIcons[ua.agent.name];
  }
  // All uas with bad reputation should have suspicious icons
  if (ua && ua.type === 'robot' && isBadReputation(reputation)) {
    icon = identityIcons.robot.suspicious;
  }
  if (!icon) {
    icon =
      identityIcons[robot ? 'robot' : (ua && ua.type) || 'unknown'][
        reputation.status || 'ok'
      ];
  }
  const label = getIdentityLabel({ robot, ua });
  return robot && robot.icon ? (
    <img className={className} src={robot.icon} alt={robot.name + ' icon'} />
  ) : (
    <SVGIcon svg={icon} className={className} alt={label + ' icon'} />
  );
};

export const IdentityPropTypes = {
  robot: PropTypes.shape({
    icon: PropTypes.string,
    name: PropTypes.string,
  }),
  reputation: PropTypes.shape({
    status: PropTypes.string,
  }),
  user_agent: PropTypes.shape({
    agent: PropTypes.shape({
      label: PropTypes.string,
    }),
  }),
};

IdentityIcon.propTypes = {
  ...IdentityPropTypes,
  className: PropTypes.string,
};

export const IdentityDefaultProps = {
  robot: null,
  reputation: {},
  user_agent: null,
};

IdentityIcon.defaultProps = {
  ...IdentityDefaultProps,
  className: '',
};

export default IdentityIcon;
