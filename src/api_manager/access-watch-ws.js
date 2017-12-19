import { Observable } from 'rxjs';
import { stringify } from 'qs';

const noop = () => {};
export default class AccessWatchWS {
  constructor({ baseUrl, accessToken }) {
    this.baseUrl = baseUrl;
    this.baseParams = {};
    if (accessToken) {
      this.baseParams.access_token = accessToken;
    }
  }
  createSocket(endpoint, params, onOpen = noop, onClose = noop) {
    return Observable.webSocket({
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
        },
      },
      closeObserver: {
        next() {
          onClose();
        },
      },
    })
      .merge(
        Observable.fromEvent(window, 'offline')
          .take(1)
          .flatMap(_ => Observable.throw('Offline!'))
      )
      .retryWhen(_ => {
        if (window.navigator.onLine) {
          // retry when timer emits
          return Observable.timer(2000);
        }
        // retry when an online event emits
        return Observable.fromEvent(window, 'online');
      });
  }
}
