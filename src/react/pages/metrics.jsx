import React from 'react';
import PropTypes from 'prop-types';
import Col from 'elemental/lib/components/Col';
import Row from 'elemental/lib/components/Row';
import omit from 'blacklist';

import { Dropdown } from 'access-watch-ui-components';

import StyledNumber from '../utilities/styled_number';

import { timeDisplay } from '../../utilities/timerange';
import { V_SET_ROUTE, dispatch } from '../../event_hub';
import { updateRouteParameter } from '../../utilities/route_utils';
import { handleTimeRangeChanged } from '../../utilities/activity';

import CircleChartContainer from '../circle_chart/circle_chart_container';
import '../../../scss/metrics_page.scss';
import TimeSelector from '../time/time_selector';
import SmoothCurve from '../graph/smooth_curve';
import ActivityTooltip from '../graph/activity_tooltip';
import Worldmap, {
  metricsPropTypes as worldMapMetricsPropTypes,
} from '../worldmap/worldmap';
import { activityPropType } from '../prop_types';

import StatusAndReputationInfos from '../../data_models/status_and_reputation';

// Remove suspicious and add default
const mapColors = {
  ...omit(
    Object.keys(StatusAndReputationInfos).reduce(
      (acc, key) => ({ ...acc, [key]: StatusAndReputationInfos[key].color }),
      {}
    ),
    'suspicious',
    'all'
  ),
  default: StatusAndReputationInfos.all.color,
};

const SMOOTH_CURVE_HEIGHT = 150;

const basicArrComp = (arr, r1, r2) =>
  arr.indexOf(r1.name) - arr.indexOf(r2.name);
const robotReputationChartOrderFunction = basicArrComp.bind(null, [
  'nice',
  'ok',
  'suspicious',
  'bad',
]);
const humansRobotsChartOrderFunction = basicArrComp.bind(null, [
  'humans',
  'robots',
]);

class MetricsPage extends React.Component {
  static propTypes = {
    type: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        path: PropTypes.string,
      })
    ).isRequired,
    status: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        path: PropTypes.string,
      })
    ).isRequired,
    requests: PropTypes.shape({
      count: PropTypes.number,
      speed: PropTypes.number,
    }).isRequired,
    metricsLoading: PropTypes.bool.isRequired,
    worldmap: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
      metrics: worldMapMetricsPropTypes.isRequired,
    }).isRequired,
    route: PropTypes.shape({
      hours: PropTypes.number,
      worldMapFilters: PropTypes.string,
      route: PropTypes.string,
    }).isRequired,
    activity: activityPropType.isRequired,
    graphActivity: activityPropType.isRequired,
  };

  handleRobotReputationChartClick = robotName => {
    dispatch({ type: V_SET_ROUTE, route: `/robots?reputation=${robotName}` });
  };

  handleHumansRobotsChartClick = type => {
    if (type === 'robots') {
      dispatch({ type: V_SET_ROUTE, route: '/robots' });
    } else {
      // TODO add redirect to humans page
    }
  };

  handleDropdownChange = worldMapFilters => {
    const { route } = this.props.route;
    dispatch({
      type: V_SET_ROUTE,
      route: updateRouteParameter({
        route,
        param: 'worldMapFilters',
        value: worldMapFilters,
      }),
    });
  };

  render() {
    const {
      metricsLoading,
      type,
      status,
      requests,
      worldmap,
      activity,
      graphActivity,
      route,
    } = this.props;
    const { worldMapFilters } = route;
    const mapColor = mapColors[worldMapFilters] || mapColors.default;

    return (
      <div className="metrics">
        <div className="page-header page-header--metrics">
          <div className="page-header__header page-header__header--metrics">
            <Row gutter={0}>
              <Col md="50%" />
              <Col md="50%">
                <div className="page-header__time-selector">
                  <TimeSelector
                    activity={activity.activity}
                    route={route}
                    hideTimerange={false}
                  />
                </div>
              </Col>
            </Row>
          </div>
          <div className="page-header__body">
            <Row gutter={0}>
              <Col gutter={30} md="16.67%" className="page-header-card">
                <p className="page-header-card__label">
                  Requests {timeDisplay(route) && `(${timeDisplay(route)})`}
                </p>
                <div className="page-header-card__value">
                  <StyledNumber
                    value={requests.count}
                    toLocaleStringOptions={{
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                    theme="metrics"
                  />
                  <div className="page-header-card__sub-value">
                    <span className="page-header-card__sub-value__metrics">
                      {'requests'}
                    </span>
                  </div>
                </div>
              </Col>
              <Col gutter={30} md="16.67%" className="page-header-card">
                <p className="page-header-card__label">Current Speed</p>
                <div className="page-header-card__value">
                  <StyledNumber value={requests.speed} theme="metrics" />
                  <div className="page-header-card__sub-value">
                    requests / min
                  </div>
                </div>
              </Col>
            </Row>
            <SmoothCurve
              data={graphActivity.activity}
              loading={graphActivity.loading}
              classSuffix="metrics"
              onRangeChanged={o =>
                handleTimeRangeChanged({ ...o, route: route.route })
              }
              height={SMOOTH_CURVE_HEIGHT}
              withTooltip
              renderTooltip={({ xValue, yValues }) => (
                <ActivityTooltip xValue={xValue} yValues={yValues} />
              )}
            />
          </div>
          <div className="page-header__filters" />
        </div>
        <Row gutter={0}>
          <Col gutter={30} md="100%">
            <Row>
              <Col xs="25%">
                <div className="metrics-card">
                  <span className="metrics-card__label">
                    Requests Distribution
                  </span>
                  <div className="left-offset-15">
                    <CircleChartContainer
                      loading={metricsLoading}
                      data={type}
                      onClick={this.handleHumansRobotsChartClick}
                      orderFn={humansRobotsChartOrderFunction}
                      classSuffix="metrics"
                    />
                  </div>
                </div>
              </Col>
              <Col xs="25%">
                <div className="metrics-card metrics-card--reputation">
                  <span className="metrics-card__label">Robots Reputation</span>
                  <CircleChartContainer
                    loading={metricsLoading}
                    data={status}
                    onClick={this.handleRobotReputationChartClick}
                    orderFn={robotReputationChartOrderFunction}
                    classSuffix="metrics"
                  />
                </div>
              </Col>
              <Col xs="50%">
                <div className="metrics-card metrics-card--country-dist">
                  <span className="metrics-card__label">
                    Country Distribution of
                    <Dropdown
                      onChange={this.handleDropdownChange}
                      activeKey={`${worldMapFilters}`}
                      values={StatusAndReputationInfos}
                    />
                  </span>
                  <Worldmap
                    activeCountry={worldmap.activeCountry}
                    metrics={worldmap.metrics}
                    loading={worldmap.loading}
                    dispatch={dispatch}
                    color={mapColor}
                  />
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}

export default MetricsPage;
