import { countries } from 'access-watch-ui-components';

import { request, poll, api, ws } from '../api_manager/api';
import createLogsFactory from './create_logs_factory';
import { getUserAgentIconSvg } from '../icons/user_agent';
import { convertBackendKeys } from '../utilities/object';

export const logsStore = {};

export const transformLog = log => {
  const { identity, robot, uuid, address } = log;
  const { countryCode } = convertBackendKeys(address);
  const sessionId = (robot && robot.id) || (identity && identity.id);
  return {
    ...log,
    // logs on the websocket don't have an id. so let's compute an alternative
    id: uuid,
    robot: robot || (identity && identity.robot),
    agentIcon: getUserAgentIconSvg(log),
    countryCode: countryCode && countryCode.toLowerCase(),
    country:
      countryCode && countries[countryCode] && countries[countryCode].name,
    ...(sessionId ? { session: { id: sessionId } } : {}),
  };
};

// returns a function that creates and returns an observable stream of logs
export default logsParams =>
  createLogsFactory({
    api: {
      http: api,
      ws,
      request,
      poll,
    },
    transformLog,
    store: logsStore,
  })(logsParams);
