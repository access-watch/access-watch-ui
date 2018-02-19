import { Observable } from 'rxjs';
import { stringify } from 'qs';

const noop = () => {};

const getDelay = n => n * 1000;

export default class AccessWatchWS {
  constructor({ baseUrl, accessToken }) {
    this.baseUrl = baseUrl;
    this.baseParams = {};
    if (accessToken) {
      this.baseParams.access_token = accessToken;
    }
  }
  createSocket(endpoint, params, onOpen = noop, onClose = noop) {
    let retriesAfterClose = 0;
    let retryObs;
    const innerObsSub = Observable.create(obs => {
      retryObs = obs;
    });
    return innerObsSub
      .map(_ => getDelay(retriesAfterClose++))
      .startWith(0)
      .switchMap(delay =>
        Observable.of(null)
          .delay(delay)
          .flatMap(() =>
            Observable.webSocket({
              url:
                this.baseUrl +
                endpoint +
                '?' +
                stringify({
                  ...this.baseParams,
                  ...params,
                }),
              openObserver: {
                next() {
                  onOpen();
                  retriesAfterClose = 0;
                },
              },
              closeObserver: {
                next(e) {
                  if (!e.wasClean) {
                    retryObs.next(e);
                  }
                  onClose();
                },
              },
            })
              .merge(
                Observable.fromEvent(window, 'offline')
                  .take(1)
                  .flatMap(_ => Observable.throw('Offline!'))
              )
              .retryWhen(_ => Observable.fromEvent(window, 'online'))
          )
      );
  }
}
