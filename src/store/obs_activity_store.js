import { Observable } from '../rx';
import { dataEvents, D_ACTIVITY } from '../event_hub';

export const INITIAL = {
  activity: [],
};

const activities = {
  global: INITIAL,
  detail: INITIAL,
};

// share a single instance and always replay the last emitted value from the
// sequence.
const onActivity = Observable.fromEvent(dataEvents, D_ACTIVITY).map(
  ({ activity, query }) => {
    const { end } = query;
    if (!end) {
      activities.global = { activity };
    } else {
      activities.detail = { activity };
    }
    return activities;
  }
);

export default Observable.merge(onActivity).publishBehavior(activities);
