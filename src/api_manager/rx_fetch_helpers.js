import { Observable } from 'rxjs';

const noop = _ => _;
const DEFAULT_RETRY_COUNT = 2;

export const request = (runPromise, retryCount = DEFAULT_RETRY_COUNT) =>
  Observable.create(sink => {
    let emitResult = res => {
      sink.next(res);
      sink.complete();
    };
    runPromise().then(emitResult, err => {
      setTimeout(_ => sink.error(err), 1000);
    });
    return () => {
      // make result handler noop
      emitResult = noop;
    };
  })
    .take(1)
    // retry on error
    .retry(retryCount);

// fallback when api fails. polls logs every 2 sec
export const poll = (
  runPromise,
  interval = 2000,
  retryCount = DEFAULT_RETRY_COUNT
) =>
  Observable.create(observer => {
    const subscription = request(runPromise)
      .do(d => {
        observer.next(d);
      }) // emit anything to observer
      .delay(interval)
      .repeat() // repeat indefinitely (until unsubscribed)
      .subscribe(
        _ => {},
        err => {
          observer.error(err);
        }
      );

    return _ => subscription.unsubscribe();
  })
    .share()
    // retry on errors
    .retry(retryCount);
