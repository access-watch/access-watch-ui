import React from 'react';
import PropTypes from 'prop-types';

import SmoothCurve from '../graph/smooth_curve';
import ActivityTooltip from '../graph/activity_tooltip';

import '../../../scss/sessions/sessions_activity.scss';

const SessionsActivity = ({
  sessions,
  onSessionClick,
  iconResolver,
  titleResolver,
  subtitleResolver,
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
          onClick={_ => onSessionClick(id)}
          onKeyPress={_ => onSessionClick(id)}
        >
          <div className="sessions-activity__session__summary">
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
            data={{ [reputation.status]: activity.reverse() }}
            height={100}
            withTooltip
            renderTooltip={({ xValue, yValues }) => (
              <ActivityTooltip xValue={xValue} yValues={yValues} />
            )}
            selectable={false}
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
};

export default SessionsActivity;
