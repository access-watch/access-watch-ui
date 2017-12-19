import { Observable } from '../rx';
import { dataEvents, D_METRICS } from '../event_hub';

export const INITIAL = {
  type: {},
  status: {},
  requests: {
    count: 0,
    speed: 0,
  },
};

// share a single instance and always replay the last emitted value from the
// sequence.
const onMetrics = Observable.fromEvent(dataEvents, D_METRICS);

export default Observable.merge(
  onMetrics.map(({ metrics }) => metrics)
).publishBehavior(INITIAL);
