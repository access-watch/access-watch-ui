import React from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import {
  getRangeFromRoute,
  handleTimeRangeChanged,
  closeTimeRangeSelector,
} from '../../utilities/activity';

import TimeRange from './time_range';
import SmoothCurve from '../graph/smooth_curve';
import { routePropType, activityDataPropType } from '../prop_types';

import '../../../scss/time_selector.scss';

const timeSelector = ({ route, activity }) => {
  const timeRange = getRangeFromRoute(route);
  return (
    <div className="timerange-selector">
      <CSSTransitionGroup
        component="div"
        transitionName="time-selector-switch"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
      >
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
};

export default timeSelector;
