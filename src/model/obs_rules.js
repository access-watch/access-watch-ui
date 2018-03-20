import { Observable } from 'rxjs';
import { rulesRoute$, rulesDetailsRoute$, routeChange$ } from '../router';
import { getRulesObs } from '../api_manager/rules_agent_api';
import rulesStore$ from '../store/obs_rules_store';
import { logMapping as addressLogMapping } from './obs_addresses';
import { logMapping as robotLogMapping } from './obs_robots';
import { createSessionDetailsObs } from './obs_session';
import { getIn } from '../utilities/object';
import { getExpiration } from '../utilities/config';

const allRulesRoute$ = rulesRoute$.merge(rulesDetailsRoute$);

const rules$ = allRulesRoute$.switchMap(_ =>
  rulesStore$
    .combineLatest(getRulesObs())
    .map(([rules]) => ({ rules }))
    .takeUntil(routeChange$)
);

const rulesDetails$ = rulesDetailsRoute$.switchMap(({ id }) =>
  rulesStore$
    .filter(({ rules }) => Object.keys(rules).length > 0)
    .take(1)
    .map(({ rules, actionPending }) => ({ rule: rules[id], actionPending }))
    .flatMap(rule => {
      const { condition } = rule.rule;
      const logMapping =
        condition.type === 'address' ? addressLogMapping : robotLogMapping;
      const { type } = condition;
      return createSessionDetailsObs({
        logMapping,
        sessionDetails$: Observable.never(),
        type,
        routeId: 'id',
      })({
        id: getIn(condition, logMapping.split('.')),
        timeSlider: getExpiration('session'),
      }).map(session => ({
        type,
        session,
      }));
    })
    .takeUntil(routeChange$)
);

export default Observable.combineLatest(
  rules$,
  Observable.merge(rulesDetails$, rulesRoute$.mapTo(null))
)
  .withLatestFrom(allRulesRoute$)
  .map(([[rules, rulesDetails], route]) => ({
    rules: rules.rules,
    rulesDetails,
    route,
  }));

rulesStore$.connect();
