import { countries } from 'access-watch-ui-components';

import { handleAction, VIEW_REQUEST_EARLIER_LOGS } from '../event_hub';
import { request, poll, api, ws } from '../api_manager/api';
import createLogsFactory from './create_logs_factory';
import { getUserAgentIconSvg } from '../icons/user_agent';

export const logsStore = {};

// log records on requets page and session details
export const transformLog = entry => ({
  ...entry,
  // logs on the websocket don't have an id. so let's compute an alternative
  id: entry.uuid,
  robot: entry.robot || (entry.identity && entry.identity.robot),
  agentIcon: getUserAgentIconSvg(entry),
  countryCode:
    entry.address.country_code && entry.address.country_code.toLowerCase(),
  country:
    entry.address.country_code &&
    countries[entry.address.country_code] &&
    countries[entry.address.country_code].name,
});

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
    handleAction,
    handleRequestEarlierLogs: handleAction(VIEW_REQUEST_EARLIER_LOGS),
  })(logsParams);
