import { Observable } from '../rx';
import monitoring$ from '../store/obs_monitoring';
import { monitoringLoading$ } from '../api_manager';
import { routeChange$, statusRoute$ } from '../../src/router';

const statusObs$ = statusRoute$.switchMap(() =>
  Observable.combineLatest(monitoring$, monitoringLoading$)
    .map(([status, statusLoading]) => ({ status, statusLoading }))
    .takeUntil(routeChange$)
);

monitoringLoading$.subscribe();

export default statusObs$;
