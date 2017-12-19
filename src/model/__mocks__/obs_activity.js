import { Observable } from 'rxjs';

const emptyActivity = {
  activity: {
    browser: 0,
    nice: 0,
    ok: 0,
    suspicious: 0,
    bad: 0,
  },
  loading: true,
};

export const ACTIVITY_INITIAL = emptyActivity;

export const detailActivity$ = Observable.of(emptyActivity);

export const globalActivity$ = Observable.of(emptyActivity);
