import React from 'react';
import PropTypes from 'prop-types';

import SmoothCurve from '../graph/smooth_curve';
import ActivityTooltip from '../graph/activity_tooltip';
import { routePropType } from '../prop_types';

import { handleTimeRangeChanged } from '../../utilities/activity';

import '../../../scss/sessions/sessions_activity.scss';

const SessionsActivity = ({
  sessions,
  onSessionClick,
  iconResolver,
  titleResolver,
  subtitleResolver,
  route,
}) => {
  const sessionMax = sessions.reduce(
    (max, { activity }) =>
      Math.max(
        max,
        activity.reduce((innerMax, [_, val]) => Math.max(innerMax, val), 0)
      ),
    0
  );
  return (
    <div className="sessions-activity">
      {sessions.map(({ activity, id, reputation, ...session }) => (
        <div
          className="sessions-activity__session"
          key={id}
          style={{ position: 'relative' }}
          onKeyPress={_ => onSessionClick(id)}
        >
          <div
            className="sessions-activity__session__summary"
            onClick={_ => onSessionClick(id)}
            onKeyPress={_ => onSessionClick(id)}
          >
            <div className="sessions-activity__session__summary__top">
              <span className="sessions-activity__session__summary__icon">
                {iconResolver(session)}
              </span>
              <span className="sessions-activity__session__summary__title">
                {titleResolver(session)}
              </span>
            </div>
            <div className="sessions-activity__session__summary__subtitle">
              {subtitleResolver(session)}
            </div>
          </div>
          <SmoothCurve
            max={sessionMax}
            data={{ [reputation.status]: activity.slice().reverse() }}
            height={100}
            withTooltip
            renderTooltip={({ xValue, yValues }) => (
              <ActivityTooltip xValue={xValue} yValues={yValues} />
            )}
            animated={false}
            onRangeChanged={o =>
              handleTimeRangeChanged({ ...o, route: route.route })
            }
            onClick={_ => onSessionClick(id)}
          />
        </div>
      ))}
    </div>
  );
};

SessionsActivity.propTypes = {
  sessions: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSessionClick: PropTypes.func.isRequired,
  iconResolver: PropTypes.func.isRequired,
  titleResolver: PropTypes.func.isRequired,
  subtitleResolver: PropTypes.func.isRequired,
  route: routePropType.isRequired,
};

export default SessionsActivity;
