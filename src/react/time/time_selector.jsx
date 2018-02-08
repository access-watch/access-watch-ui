import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransitionGroup } from 'react-transition-group';
import {
  getRangeFromRoute,
  handleTimeRangeChanged,
  closeTimeRangeSelector,
} from '../../utilities/activity';
import {
  handleTimeSliderChange,
  secondsToShortDisplay,
} from '../../utilities/timerange';
import config from '../../app_config';

import TimeRange from './time_range';
import SmoothCurve from '../graph/smooth_curve';
import { routePropType, activityDataPropType } from '../prop_types';
import Slider from '../utilities/slider';

import '../../../scss/time_selector.scss';

const convertToSliderValues = values =>
  values.reduce(
    (acc, v) => [
      ...acc,
      {
        id: v,
        text: typeof v === 'string' ? v : secondsToShortDisplay(v * 60),
      },
    ],
    []
  );

const timeSelector = ({ route, activity, hideTimerange }) => {
  const timeRange = getRangeFromRoute(route);
  const timerangeStyle = hideTimerange ? { opacity: 0 } : {};
  const { timeSlider } = route;
  return (
    <div className="timerange-selector">
      <CSSTransitionGroup
        component="div"
        transitionName="time-selector-switch"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
      >
        {!timeRange && (
          <div style={timerangeStyle}>
            <Slider
              activeKey={timeSlider}
              values={convertToSliderValues(config.time.sliderValues)}
              onChange={value => {
                handleTimeSliderChange(route.route, value);
              }}
              className="slider--dashboard"
              key="slider"
            />
          </div>
        )}
        {timeRange && (
          <div className="timerange-selector__curve" key="curve">
            <div className="timerange-selector__smooth-curve-container">
              <SmoothCurve
                data={activity}
                classSuffix="time-selector"
                onRangeChanged={p =>
                  handleTimeRangeChanged({ ...p, route: route.route })
                }
                selectedRange={timeRange}
                withHandlers
              />
            </div>
            <TimeRange {...timeRange} />
            <div
              className="timerange-selector__curve__close-btn"
              onClick={_ => closeTimeRangeSelector(route.route)}
              onKeyPress={_ => closeTimeRangeSelector(route.route)}
            />
          </div>
        )}
      </CSSTransitionGroup>
    </div>
  );
};

timeSelector.propTypes = {
  route: routePropType.isRequired,
  activity: activityDataPropType.isRequired,
  hideTimerange: PropTypes.bool,
};

timeSelector.defaultProps = {
  hideTimerange: false,
};

export default timeSelector;
