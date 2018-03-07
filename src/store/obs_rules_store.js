import omit from 'blacklist';

import { Observable } from '../rx';
import {
  dataEvents,
  viewEvents,
  D_RULES,
  V_ADD_RULE,
  D_ADD_RULE_SUCCESS,
  D_ADD_RULE_ERROR,
  V_DELETE_RULE,
  D_DELETE_RULE_SUCCESS,
  D_DELETE_RULE_ERROR,
} from '../event_hub';

const INITIAL_STATE = {
  rules: {},
  actionPending: false,
};

// We only handle incoming sessions from this event, session_details are handled
// individually.
const onRules = Observable.fromEvent(dataEvents, D_RULES).map(
  ({ rules }) => state => ({
    ...state,
    rules,
  })
);

const onViewActions = Observable.merge(
  Observable.fromEvent(viewEvents, V_ADD_RULE),
  Observable.fromEvent(viewEvents, V_DELETE_RULE)
).map(_ => state => ({
  ...state,
  actionPending: true,
}));

const onAddRuleError = Observable.fromEvent(dataEvents, D_ADD_RULE_ERROR).map(
  _ => state => ({
    ...state,
    actionPending: false,
  })
);

const onAddRuleSuccess = Observable.fromEvent(
  dataEvents,
  D_ADD_RULE_SUCCESS
).map(({ rule }) => state => ({
  ...state,
  rules: {
    ...omit(state.rules, rule.id),
    [rule.id]: rule,
  },
  actionPending: false,
}));

const onRemoveRuleSuccess = Observable.fromEvent(
  dataEvents,
  D_DELETE_RULE_SUCCESS
).map(({ rule }) => state => ({
  ...state,
  rules: omit(state.rules, rule.id),
  actionPending: false,
}));

const onRemoveRuleError = Observable.fromEvent(
  dataEvents,
  D_DELETE_RULE_ERROR
).map(() => state => ({
  ...state,
  actionPending: false,
}));

const rulesReducer$ = Observable.merge(
  onRules,
  onViewActions,
  onAddRuleSuccess,
  onAddRuleError,
  onRemoveRuleSuccess,
  onRemoveRuleError
);

const rules$ = Observable.of(INITIAL_STATE)
  .merge(rulesReducer$)
  .scan((state, reducer) => reducer(state))
  .publishBehavior();

export default rules$;
