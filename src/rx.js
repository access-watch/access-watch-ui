// This is the tools we use from Rxjs, explicitly defined!
// This should be used in out application rather than requiring rxjs manually,
// it could have big impact on the bundle size otherwise.

import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/concat';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/zip';
import 'rxjs/add/observable/dom/webSocket';

import 'rxjs/add/operator/bufferTime';
import 'rxjs/add/operator/bufferCount';
import 'rxjs/add/operator/onErrorResumeNext';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/exhaustMap'; // PKA flatMapFirst
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap'; // AKA flatMap
import 'rxjs/add/operator/observeOn';
import 'rxjs/add/operator/publish';
import 'rxjs/add/operator/publishBehavior';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/repeat';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/retryWhen'; // Worldmap
import 'rxjs/add/operator/sampleTime';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap'; // PKA flatMapLatest
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/withLatestFrom';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
import { queue } from 'rxjs/scheduler/queue';

export { Observable } from 'rxjs/Observable';
export { BehaviorSubject } from 'rxjs/BehaviorSubject';
export { ReplaySubject } from 'rxjs/ReplaySubject';
export { Subject } from 'rxjs/Subject';
export const Scheduler = {
  queue,
  animationFrame,
};
