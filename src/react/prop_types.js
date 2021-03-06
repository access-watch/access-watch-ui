import PropTypes from 'prop-types';

export const speedPropTypeValues = {
  count: PropTypes.number.isRequired,
  speed: PropTypes.number.isRequired,
  speeds: PropTypes.shape({
    perHour: PropTypes.arrayOf(PropTypes.number),
    perMinute: PropTypes.arrayOf(PropTypes.number).isRequired,
  }),
};

export const speedPropType = PropTypes.shape(speedPropTypeValues);

export const reputationPropType = PropTypes.shape({
  threats: PropTypes.arrayOf(PropTypes.string),
  status: PropTypes.string,
});

export const addressPropType = PropTypes.shape({
  as_number: PropTypes.string,
  country_code: PropTypes.string,
  flags: PropTypes.arrayOf(PropTypes.string),
  hostname: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string,
  network_name: PropTypes.string,
  reputation: reputationPropType,
  value: PropTypes.string.isRequired,
});

export const identityPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
});

export const requestPropType = PropTypes.shape({
  address: PropTypes.string,
  captured_headers: PropTypes.arrayOf(PropTypes.string),
  headers: PropTypes.objectOf(PropTypes.string),
  host: PropTypes.string,
  method: PropTypes.string.isRequired,
  protocol: PropTypes.string,
  time: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
});

export const responsePropType = PropTypes.shape({
  status: PropTypes.number.isRequired,
});

export const userAgentPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
});

export const robotPropType = PropTypes.shape({
  description: PropTypes.string,
  flags: PropTypes.arrayOf(PropTypes.string),
  icon: PropTypes.string,
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  name: PropTypes.string,
  reputation: reputationPropType,
  url: PropTypes.string,
  type: PropTypes.string,
});

export const logPropType = PropTypes.shape({
  address: addressPropType,
  countryCode: PropTypes.string,
  id: PropTypes.string.isRequired,
  identity: identityPropType,
  reputation: reputationPropType,
  request: requestPropType,
  response: responsePropType,
  robot: robotPropType,
  session: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }),
  user_agent: userAgentPropType,
  uuid: PropTypes.string.isRequired,
});

export const logsPropType = PropTypes.shape({
  loading: PropTypes.bool.isRequired,
  logs: PropTypes.arrayOf(logPropType),
  streamOpen: PropTypes.bool.isRequired,
});

export const sessionPropTypeValues = {
  end: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
  start: PropTypes.number,
  type: PropTypes.string.isRequired,
  updated: PropTypes.number.isRequired,
  identity: identityPropType,
  reputation: reputationPropType,
  user_agents: PropTypes.arrayOf(userAgentPropType),
  ...speedPropTypeValues,
};

const createSessionsPropType = sessionTypeProps =>
  PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    sessions: PropTypes.arrayOf(
      PropTypes.shape({
        ...sessionPropTypeValues,
        ...sessionTypeProps,
      })
    ).isRequired,
  });

export const robotSessionsPropType = createSessionsPropType({
  robot: robotPropType.isRequired,
});

export const addressSessionsPropType = createSessionsPropType({
  address: addressPropType.isRequired,
});

export const routePropType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
});

export const activityDataPropType = PropTypes.objectOf(
  PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))
);

export const activityPropType = PropTypes.shape({
  loading: PropTypes.bool.isRequired,
  activity: activityDataPropType.isRequired,
});

const metricsStatusPropType = PropTypes.shape({
  count: PropTypes.number.isRequired,
  percentage: PropTypes.number.isRequired,
});

export const robotsMetricsPropType = PropTypes.shape({
  status: PropTypes.objectOf(metricsStatusPropType).isRequired,
  total: PropTypes.number.isRequired,
});

export const metricsPropType = PropTypes.shape({
  loading: PropTypes.bool.isRequired,
  requests: speedPropType,
  status: PropTypes.objectOf(metricsStatusPropType).isRequired,
  type: PropTypes.objectOf(metricsStatusPropType).isRequired,
});

export const searchPropType = PropTypes.shape({
  id: PropTypes.string,
  filter: PropTypes.string,
  label: PropTypes.string,
});

export const searchesPropType = PropTypes.shape({
  searches: PropTypes.arrayOf(searchPropType),
  actionPending: PropTypes.bool.isRequired,
});
