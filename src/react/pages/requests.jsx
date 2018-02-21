import React from 'react';
import PropTypes from 'prop-types';
import Col from 'elemental/lib/components/Col';
import Row from 'elemental/lib/components/Row';
import { stringify } from 'qs';

import { V_SET_ROUTE, dispatch, V_REQUEST_EARLIER_LOGS } from '../../event_hub';
import { updateRouteParameter } from '../../utilities/route_utils';
import {
  dayEquality,
  getPureDayFromDate,
} from '../../utilities/date_utilities';
import { timeDisplay } from '../../utilities/timerange';

import Logs from '../logs/logs2';
import LogsRow from '../logs/logs_row';
import LogsSeparator from '../logs/logs_separator';
import SearchLogs from '../logs/search_logs';
import FiltersLogs from '../logs/filters_logs';
import TimeSelector from '../time/time_selector';
import { logPropType, activityPropType } from '../prop_types';

import '../../../scss/requests_page.scss';

import { nearPageBottom$, keydown } from '../../utilities/interaction';

const ROW_HEIGHT = 30;
const SEPARATOR_HEIGHT = ROW_HEIGHT * 1.5;

// map log entry keys to label names
const COLUMNS = {
  'reputation.preview': '',
  timeH: 'Time',
  identity: 'Identity',
  'address.label': 'Address',
  'request.method': 'Method',
  'request.host': 'Host',
  'request.url': 'URL',
  'response.status': 'Status',
};

class LogsPage extends React.Component {
  static propTypes = {
    logs: PropTypes.arrayOf(logPropType).isRequired,
    loading: PropTypes.bool.isRequired,
    earlierLoading: PropTypes.bool,
    route: PropTypes.shape({
      q: PropTypes.string,
      route: PropTypes.string,
      filtersEnabled: PropTypes.bool,
    }).isRequired,
    logEnd: PropTypes.bool,
    activity: activityPropType.isRequired,
  };

  static defaultProps = {
    earlierLoading: false,
    logEnd: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      fullTextSearchOpened: !!props.route.q,
      earlierLoading: false,
    };
  }

  componentWillMount() {
    this.paginateSubscription = nearPageBottom$
      .filter(
        // don't do anything while loading
        _ => !this.props.loading || !this.props.earlierLoading
      )
      .subscribe(this.handleGetEarlierLogs.bind(this));

    if (!this.state.fullTextSearchOpened) {
      this.keydownS = keydown('s').subscribe(this.showSearch);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { earlierLoading } = nextProps;
    if (earlierLoading === true) {
      this.setState({ earlierLoading: false });
    }
  }

  componentWillUnmount() {
    this.paginateSubscription.unsubscribe();
    if (this.keydownS) {
      this.keydownS.unsubscribe();
    }
  }

  handleGetEarlierLogs = _ => {
    const { earlierLoading, route, logs, logEnd } = this.props;
    if (!this.state.earlierLoading && !earlierLoading && !logEnd) {
      this.setState({ earlierLoading: true });
      dispatch({
        type: V_REQUEST_EARLIER_LOGS,
        q: route.q || '',
        filters: (route.filtersEnabled && route.filters) || {},
        end: new Date(logs[logs.length - 1].request.time).getTime(),
      });
    }
  };

  handleSearch = query => {
    const { route } = this.props.route;
    dispatch({
      type: V_SET_ROUTE,
      route: updateRouteParameter({ route, param: 'q', value: query }),
    });
  };

  handleFiltersChange = filters => {
    const { route } = this.props.route;
    dispatch({
      type: V_SET_ROUTE,
      route: updateRouteParameter({
        route: updateRouteParameter({
          route,
          param: 'filters',
          value: filters,
        }),
        param: 'filtersEnabled',
        value: 'true',
      }),
    });
  };

  handleFiltersToggleEnabled = _ => {
    const { filtersEnabled, route } = this.props.route;
    dispatch({
      type: V_SET_ROUTE,
      route: updateRouteParameter({
        route,
        param: 'filtersEnabled',
        value: '' + !filtersEnabled,
      }),
    });
  };

  handleRowClick = logRecord => {
    const query = {
      hl: logRecord.id,
    };
    dispatch({
      type: V_SET_ROUTE,
      route: `/requests/${logRecord.session.id}?${stringify(query)}`,
    });
  };

  removeSearchQuery = e => {
    e.preventDefault();
    this.handleSearch();
    this.setState({ fullTextSearchOpened: false }, _ => {
      this.keydownS = keydown('s').subscribe(this.showSearch);
    });
  };

  showSearch = _ => {
    this.setState({ fullTextSearchOpened: true });
    this.keydownS.unsubscribe();
    this.keydownS = null;
  };

  renderRowWithSeparator = (row, i) => {
    const { logs } = this.props;
    const logsRow = (
      <LogsRow
        key={row.id}
        id={row.id}
        rowHeight={ROW_HEIGHT}
        entry={row}
        columns={COLUMNS}
        onClick={this.handleRowClick}
        className="logs__row--interactive"
      />
    );
    let previousDate;
    if (i > 0) {
      previousDate = new Date(logs[i - 1].request.time);
    } else {
      previousDate = new Date();
    }
    const currentDate = new Date(row.request.time);
    if (!dayEquality(currentDate, previousDate)) {
      const separatorDate = getPureDayFromDate(currentDate);
      return [
        <LogsSeparator
          date={separatorDate}
          height={SEPARATOR_HEIGHT}
          columnsLength={Object.keys(COLUMNS).length}
        />,
        logsRow,
      ];
    }
    return logsRow;
  };

  render() {
    const {
      route,
      logs,
      loading,
      earlierLoading,
      logEnd,
      activity,
    } = this.props;
    const { fullTextSearchOpened } = this.state;

    return (
      <div className="requests-page">
        <div className="page-header page-header--requests">
          <div className="page-header__header">
            <Row gutter={0}>
              <Col md="60%">
                <span className="page-header__header-title">
                  {!route.timerangeFrom && 'Latest'} Requests{' '}
                  {route.timerangeFrom && `(${timeDisplay(route)})`}
                </span>
              </Col>
              <Col md="40%">
                <div className="page-header__time-selector">
                  <TimeSelector
                    activity={activity.activity}
                    route={route}
                    hideTimerange
                  />
                </div>
              </Col>
            </Row>
          </div>
          <div className="logs-filters-container">
            <FiltersLogs
              currentFilters={route.filters}
              onFiltersChanged={this.handleFiltersChange}
              enabled={route.filtersEnabled}
              onToggleEnabled={this.handleFiltersToggleEnabled}
            />
          </div>
        </div>
        {fullTextSearchOpened && (
          <SearchLogs
            disabled={loading}
            query={route.q}
            onSearch={this.handleSearch}
          />
        )}
        <Logs
          columns={COLUMNS}
          logs={logs}
          rowHeight={ROW_HEIGHT}
          stickyHeader
          renderRow={this.renderRowWithSeparator}
          earlierLoading={this.state.earlierLoading || earlierLoading}
          logEnd={logEnd && logs.length > 0}
        />
        {!loading &&
          logs.length === 0 && (
            <div className="logs-empty">
              <div className="logs-empty__content">
                <p>No logs available. Waiting for real-time logs.</p>
                {route.q && (
                  <button onClick={this.removeSearchQuery}>
                    Try clearing your search query
                  </button>
                )}
              </div>
            </div>
          )}
      </div>
    );
  }
}

export default LogsPage;
