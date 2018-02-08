import { stringify } from 'qs';
import { request, poll } from './rx_fetch_helpers';

const resolveContentType = res => {
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    return res.json();
  }
  return res.text();
};

const status = res => (res.ok ? res : Promise.reject(res));

const DEFAULT_TIMEOUT = 60000;

const withTimeout = (promise, ms = DEFAULT_TIMEOUT) =>
  new Promise((resolve, reject) => {
    setTimeout(_ => {
      reject(new Error('timeout'));
    }, ms);
    promise.then(resolve, reject);
  });

/**
 * Manages api calls to AccessWatch
 */
export default class AccessWatchAPI {
  constructor({ apiBaseUrl, accessToken }) {
    this.apiBase = apiBaseUrl;
    const authHeader = {};
    if (accessToken) {
      authHeader.Authorization = `Bearer ${accessToken}`;
    }
    this.headers = {
      get: {
        ...authHeader,
      },
      post: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
    };

    this.request = request;
    this.poll = poll;
  }

  stringifyUrlRequest(endpoint, params, method = 'GET') {
    return withTimeout(
      fetch(this.apiBase + endpoint + '?' + stringify(params), {
        method,
        credentials: 'same-origin',
        headers: this.headers.get,
      })
    )
      .then(status)
      .then(resolveContentType);
  }

  get(endpoint, params) {
    return this.stringifyUrlRequest(endpoint, params);
  }

  post(endpoint, params) {
    return withTimeout(
      fetch(this.apiBase + endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        body: JSON.stringify(params),
        headers: this.headers.post,
      })
    )
      .then(status)
      .then(resolveContentType);
  }

  delete(endpoint, params) {
    return this.stringifyUrlRequest(endpoint, params, 'DELETE');
  }
}
