import { filterToURI } from './filter';
import { dispatch, V_REQUEST_EARLIER_LOGS } from '../event_hub';

// eslint-disable-next-line import/prefer-default-export
export const requestEarlierLogs = ({ logMapping, value }) => end => {
  dispatch({
    type: V_REQUEST_EARLIER_LOGS,
    logMapping,
    filter: filterToURI({
      id: logMapping,
      values: [value],
    }),
    end,
  });
};
