import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { FlagIcon } from 'access-watch-ui-components';

import Button from '../utilities/button';
import '../../../scss/sessions/request_info.scss';
import httpCodes from '../../data/http-codes.json';
import { logPropType } from '../prop_types';

export default class RequestInfo extends Component {
  static propTypes = {
    entry: logPropType.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  render() {
    const { entry } = this.props;
    const { address, request, response } = entry;
    const ddWithEmpty = (label, value, key) => (
      <dd key={key ? `${label}-${key}` : label}>
        <span className="request-info__label">{label}:</span>
        {value ? (
          <span className="request-info__value"> {value} </span>
        ) : (
          <span className="request-info__value request-info__value--empty">
            {'<empty>'}
          </span>
        )}
      </dd>
    );
    const dd = (label, value) => value && ddWithEmpty(label, value);
    const queryParams = queryString => {
      if (!queryString) return null;

      const queryArr = queryString.split('&');
      return queryArr.map((qItem, idx) =>
        ddWithEmpty(
          ...qItem
            .split('=')
            .map(i => decodeURIComponent(i.replace(/\+/g, ' '))),
          idx
        )
      );
    };

    const statusCodeToStatusPhrase = status => {
      const httpCodeObj = httpCodes.find(
        httpCode => parseInt(httpCode.code, 10) === parseInt(status, 10)
      );
      return httpCodeObj ? httpCodeObj.phrase : '';
    };

    const statusCode = status => (
      <span
        className={cx('request-info__status-code', {
          'request-info__status-code--green': status < 300,
          'request-info__status-code--yellow': status >= 300 && status < 400,
          'request-info__status-code--red': status >= 400,
        })}
      >
        {status} {statusCodeToStatusPhrase(status)}
      </span>
    );

    const queryStringDelimiter = request.url.indexOf('?');
    const path =
      queryStringDelimiter === -1
        ? request.url
        : request.url.substr(0, queryStringDelimiter);
    const queryString =
      queryStringDelimiter === -1
        ? false
        : request.url.substr(queryStringDelimiter + 1);

    return (
      <div className="request-info">
        <Button className="request-info__close" onClick={this.props.onClose} />
        <dl className="request-info__section">
          <dt className="request-info__header">Request</dt>
          {dd(
            'Method',
            <span className="request-info__bubble">{request.method}</span>
          )}
          {dd('Host', request.headers && request.headers.host)}
          {dd('Path', path)}
          {dd('Protocol', request.protocol)}
          <dd className="request-info__sub-section">
            <dl>
              <dt className="request-info__header">Headers</dt>
              {Object.keys(request.headers).map(key =>
                dd(key, request.headers[key])
              )}
            </dl>
          </dd>
          {queryString && (
            <dd className="request-info__sub-section request-info__sub-section--queryStringParameters">
              <dl>
                <dt className="request-info__header">
                  Query String Parameters
                </dt>
                {queryParams(queryString)}
              </dl>
            </dd>
          )}
        </dl>
        <dl className="request-info__section">
          <dt className="request-info__header">IP Address</dt>
          {dd(
            'IP',
            <a
              href={`https://access.watch/database/addresses/${address.value}`}
              target="_blank"
              rel="noreferrer noopener"
              title="More about this address in Access Watch database"
            >
              {address.value}
            </a>
          )}
          {dd('Hostname', address.hostname)}
          {dd(
            'Country',
            entry.countryCode &&
              entry.country && (
                <span>
                  {entry.countryCode && (
                    <FlagIcon title={entry.country} cc={entry.countryCode} />
                  )}
                  {entry.country}
                </span>
              )
          )}
          {address.flags.length > 0 &&
            dd(
              'Flags',
              address.flags.map(f => (
                <span key={f} className="request-info__bubble">
                  {f}
                </span>
              ))
            )}
        </dl>
        <dl className="request-info__section">
          <dt className="request-info__header">Response</dt>
          {dd('Status', statusCode(response.status))}
        </dl>
      </div>
    );
  }
}
