import { Observable } from '../rx';
import { dataEvents, D_MONITORING } from '../event_hub';

// share a single instance and always replay the last emitted value from the
// sequence.
const onMonitoring = Observable.fromEvent(dataEvents, D_MONITORING);

export default onMonitoring;
