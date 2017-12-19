import { rulesRoute$, routeChange$ } from '../router';
import { getRulesObs } from '../api_manager/rules_agent_api';
import rules$ from '../store/obs_rules_store';

export default rulesRoute$.switchMap(_ =>
  rules$
    .combineLatest(getRulesObs())
    .map(([rules]) => ({ rules }))
    .takeUntil(routeChange$)
);

rules$.connect();
