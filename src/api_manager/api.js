import AccessWatchAPI from './access-watch-api';
import AccessWatchWS from './access-watch-ws';
import config from '../app_config';

export const api = new AccessWatchAPI(config);

export const ws = new AccessWatchWS({
  baseUrl: config.websocket,
  apiKey: config.apiKey,
});

export * from './rx_fetch_helpers';
