import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { ReplaySubject } from 'rxjs';

import { V_SET_ROUTE, dispatch } from '../../event_hub';
import {
  updateRouteParameter,
  deleteRouteParameter,
} from '../../utilities/route_utils';

import { keydown, KEY_CODE, nearPageBottom } from '../../utilities/interaction';
import Logs from '../logs/logs2';
import LogsHeader from '../logs/logs_header';
import LogsRow from '../logs/logs_row';
import LoadingIcon from '../utilities/loading_icon';
import RequestInfo from './request_info';
import { routePropType, logPropType } from '../prop_types';

import '../../../scss/sessions/abstract_session_details.scss';

const ROW_HEIGHT = 30;

export const DEFAULT_COLUMNS = {
  time: 'Time',
  'address.label': 'Address',
  'user_agent.agent.label': 'User Agent',
  'request.method': 'Method',
  'request.host': 'Host',
  'request.url': 'URL',
  'response.status': 'Status',
};

class AbstractSessionDetails extends React.Component {
  static propTypes = {
    title: PropTypes.node.isRequired,
    icon: PropTypes.node,
    moreButton: PropTypes.shape({
      text: PropTypes.string,
      url: PropTypes.string,
      status: PropTypes.string,
    }),
    description: PropTypes.string,
    headerRowChildren: PropTypes.node.isRequired,
    actionChildren: PropTypes.node,
    logs: PropTypes.shape({
      logs: PropTypes.array,
      loading: PropTypes.bool,
      earlierLoading: PropTypes.bool,
    }).isRequired,
    requestInfo: logPropType,
    route: routePropType.isRequired,
    muteParentEsc: PropTypes.func,
    logsColumns: PropTypes.objectOf(PropTypes.string),
    handleGetEarlierLogs: PropTypes.func.isRequired,
  };

  static defaultProps = {
    description: '',
    icon: null,
    moreButton: null,
    actionChildren: null,
    requestInfo: null,
    muteParentEsc: _ => _,
    logsColumns: DEFAULT_COLUMNS,
  };

  constructor(props) {
    super(props);
    const { requestInfo } = props;
    this.state.requestInfo = requestInfo;
    if (requestInfo) {
      this.handleRequestInfoOpened();
    }
  }

  state = {
    requestInfo: null,
  };

  componentDidMount() {
    const { logs } = this.props;

    this.paginateSubscription = nearPageBottom(this.scrollContainer)
      .filter(
        // don't do anything while loading
        _ => !logs.loading || !logs.earlierLoading || !logs.end
      )
      .subscribe(this.handleGetEarlierLogs.bind(this));

    this.logsContainer$.next(this.scrollContainer);
  }

  componentWillReceiveProps(nextProps) {
    const { logs, route } = nextProps;
    const { requestInfo, waitForNextLoading, loadedLogs } = this.state;
    let currentLogs = loadedLogs || logs;

    if (!nextProps.logs.loading && !waitForNextLoading) {
      this.setState({ loadedLogs: undefined });
      currentLogs = logs;
    }

    if (nextProps.logs.loading) {
      this.setState({ waitForNextLoading: undefined });
    }

    if (nextProps.logs.earlierLoading) {
      this.earlierLoading = false;
    }
    if (
      route.hl &&
      currentLogs.logs &&
      (!requestInfo || requestInfo.id !== route.hl)
    ) {
      this.setState(
        {
          requestInfo: currentLogs.logs.find(row => row.id === route.hl),
        },
        this.handleRequestInfoOpened
      );
    } else if (!route.hl && requestInfo) {
      this.setState(
        {
          requestInfo: null,
        },
        this.handleRequestInfoClosed
      );
    }
  }

  // Emits container of the logs once its available in the dom
  // This is the scolling element when browsing the logs
  logsContainer$ = new ReplaySubject(1);

  handleGetEarlierLogs = _ => {
    const { logs, handleGetEarlierLogs } = this.props;
    if (
      !logs.earlierLoading &&
      !logs.loading &&
      !logs.end &&
      !this.earlierLoading
    ) {
      this.earlierLoading = true;
      handleGetEarlierLogs(
        new Date(logs.logs[logs.logs.length - 1].request.time).getTime()
      );
    }
  };

  handleLogsRowClick = row => {
    const { route, logs } = this.props;
    this.setState({ loadedLogs: logs, waitForNextLoading: true });
    if (route.hl && route.hl === row.id) {
      this.handleRequestInfoClose();
    } else {
      dispatch({
        type: V_SET_ROUTE,
        route: updateRouteParameter({
          route: route.route,
          param: 'hl',
          value: row.id,
        }),
      });
    }
  };

  handleRequestInfoOpened = _ => {
    const { muteParentEsc } = this.props;
    muteParentEsc(true);
    this.escSubscription = keydown(KEY_CODE.ESC).subscribe(
      this.handleRequestInfoClose
    );
  };

  handleRequestInfoClosed = _ => {
    const { muteParentEsc } = this.props;
    this.escSubscription.unsubscribe();
    muteParentEsc(false);
  };

  handleRequestInfoClose = _ => {
    const { route } = this.props.route;
    dispatch({
      type: V_SET_ROUTE,
      route: deleteRouteParameter({ route, param: 'hl' }),
    });
  };

  render() {
    const {
      logs,
      route,
      title,
      icon,
      moreButton,
      description,
      headerRowChildren,
      actionChildren,
      logsColumns,
    } = this.props;

    const { requestInfo, loadedLogs, previousHl } = this.state;
    const displayedLogs = loadedLogs || logs;
    const displayedHl = previousHl || route.hl;

    return (
      <div>
        <div className="session-details__top">
          <div style={{ overflow: 'hidden' }}>
            <div className="session-details__left">
              <div className="session-details__header">
                {icon &&
                  React.cloneElement(icon, {
                    className: 'session-details__icon',
                  })}
                <span className="text-line text-line--header">{title}</span>
                {moreButton && (
                  <span
                    className={cx([
                      'session-details__button',
                      moreButton.status,
                    ])}
                  >
                    <a
                      rel="noopener noreferrer"
                      target="_blank"
                      href={moreButton.url}
                    >
                      {moreButton.text}
                    </a>
                  </span>
                )}
              </div>
            </div>
            <div className="session-details__right">
              {actionChildren && actionChildren}
            </div>
          </div>
          <div className="session-details__top__bottom">
            <div className="session-details__description">{description}</div>
            <div className="session-details__bottom-row">
              {headerRowChildren}
            </div>
          </div>
        </div>
        <div className="session-details__bottom">
          <LogsHeader rowHeight={ROW_HEIGHT} columns={logsColumns} />
          <div
            ref={c => {
              this.scrollContainer = c;
            }}
            className="session-details__logs"
          >
            {displayedLogs && (
              <Logs
                columns={logsColumns}
                logs={displayedLogs.logs}
                logEnd={displayedLogs.end}
                rowHeight={ROW_HEIGHT}
                renderRow={row => (
                  <LogsRow
                    key={row.id}
                    id={row.id}
                    rowHeight={ROW_HEIGHT}
                    entry={row}
                    columns={logsColumns}
                    className={cx('logs__row--interactive', {
                      'logs__row--hl': displayedHl === row.id,
                    })}
                    onClick={this.handleLogsRowClick}
                  />
                )}
                container$={this.logsContainer$.asObservable()}
                fixedPos
                noHeader
              />
            )}
            {!displayedLogs.loading &&
              displayedLogs.logs.length === 0 && (
                <div className="session-details__logs__empty">
                  No logs available. Waiting for real-time logs.
                </div>
              )}
            {displayedLogs.loading &&
              (!displayedLogs.logs || !displayedLogs.logs.length) && (
                <div className="loading-box">
                  <LoadingIcon message="loading requests..." />
                </div>
              )}
          </div>
          {requestInfo && (
            <div className="session-details__request-info">
              <RequestInfo
                entry={requestInfo}
                onClose={this.handleRequestInfoClose}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default AbstractSessionDetails;
