import { Observable } from 'rxjs';

export const api = {
  get: () => Promise.resolve(),
  post: () => Promise.resolve(),
  request: () => Observable.empty(),
  poll: () => Observable.empty(),
};

export const ws = {
  createSocket: () => Observable.empty(),
};

export const request = _ => Observable.empty();
export const poll = _ => Observable.empty();
