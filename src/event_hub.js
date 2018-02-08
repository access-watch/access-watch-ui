import EventEmitter from 'events';
import { Observable } from 'rxjs';

export const dataEvents = new EventEmitter();
export const viewEvents = new EventEmitter();

// D as in data events (api etc)
export const D_SESSIONS = 'data.sessions';
export const D_METRICS = 'data.metrics';
export const D_MONITORING = 'data.monitoring';
export const D_ACTIVITY = 'data.activity';
export const D_RULES = 'data.rules';

export const V_SET_ROUTE = 'view.set_route';
export const V_SHOW_TEXT_TOOLTIP = 'view.show_text_tooltip';
export const V_UPDATE_ROUTE_PARAMS = 'view.update_route_params';
export const V_REQUEST_EARLIER_LOGS = 'view.req_earlier_logs';

export const V_SHOW_TOOLTIP = 'view.show_tooltip';
export const V_SET_TOOLTIP = 'view.set_tooltip';

export const V_ADD_RULE = 'view.add_rule';
export const V_DELETE_RULE = 'view.delete_rule';
export const D_ADD_RULE_SUCCESS = 'data.add_rule.success';
export const D_ADD_RULE_ERROR = 'data.add_rule.error';
export const D_DELETE_RULE_SUCCESS = 'data.delete_rule.success';
export const D_DELETE_RULE_ERROR = 'data.delete_rule.error';

export const handleAction = type =>
  Observable.fromEvent(viewEvents, type).merge(
    Observable.fromEvent(dataEvents, type)
  );

export const dispatch = act => viewEvents.emit(act.type, act);
