import { poll, api } from './api';
import {
  viewEvents,
  dataEvents,
  V_ADD_RULE,
  D_RULES,
  D_ADD_RULE_SUCCESS,
  D_ADD_RULE_ERROR,
  V_REMOVE_RULE,
  D_REMOVE_RULE_SUCCESS,
  D_REMOVE_RULE_ERROR,
} from '../event_hub';

import { getAvgSpeedAndCount } from './utils';
import { convertObjValues } from '../utilities/object';

const transformSpeeds = ({ blocked, passed, ...rest }) => ({
  ...rest,
  blocked: getAvgSpeedAndCount({ speed: blocked }),
  passed: getAvgSpeedAndCount({ speed: passed }),
});

const getRules = () =>
  api.get('/rules').then(convertObjValues(transformSpeeds));

const emitRules = rules => {
  dataEvents.emit(D_RULES, { rules });
};

const updateRules = () => getRules().then(emitRules);

export const getRulesObs = (_, pollInterval = 5000) =>
  poll(updateRules, pollInterval);

const conditionCreators = {
  address: address => ({
    type: 'address',
    address,
  }),
};

export const conditionDisplays = {
  address: condition => condition.address.value,
};

export const displayRule = ({ condition }) => {
  const conditionDisplay = conditionDisplays[condition.type];
  if (conditionDisplay) {
    return conditionDisplay(condition);
  }
  // eslint-disable-next-line
  console.warn('Warning: cannot find display for condition type ' + type);
  return '';
};

export const conditionMatchers = {
  address: ({ address }) => ({ condition }) =>
    address.value === condition.address.value,
};

export const matchCondition = type => session => rule => {
  const conditionMatcher = conditionMatchers[type];
  if (conditionMatcher) {
    return conditionMatcher(session)(rule);
  }
  return false;
};

const createCondition = ({ type, value }) => {
  const conditionCreator = conditionCreators[type];
  if (conditionCreator) {
    return conditionCreator(value);
  }
  throw new Error('Unknown condition ' + type);
};

export const postRule = rule => api.post('/rules', rule);

export const deleteRule = ({ id }) => api.delete(`/rules/${id}`);

viewEvents.on(V_ADD_RULE, ({ rule }) => {
  postRule({
    condition: createCondition(rule),
  })
    .then(() => {
      updateRules().then(() => {
        dataEvents.emit(D_ADD_RULE_SUCCESS, null);
      });
    })
    .catch(err => {
      dataEvents.emit(D_ADD_RULE_ERROR, err);
    });
});

viewEvents.on(V_REMOVE_RULE, ({ rule }) => {
  deleteRule(rule)
    .then(() => {
      dataEvents.emit(D_REMOVE_RULE_SUCCESS, { rule });
    })
    .catch(err => {
      dataEvents.emit(D_REMOVE_RULE_ERROR, err);
    });
});
