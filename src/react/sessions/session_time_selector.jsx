import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { activityPropType } from '../prop_types';
import TimeSelector from '../time/time_selector';
import { canDisplayTimerange, hasTimerange } from './timerange_utils';

import '../../../scss/sessions/session_time_selector.scss';

const SessionTimeSelector = ({ route, activity }) => {
  const disabledTimerange = !canDisplayTimerange && hasTimerange(route);
  return (
    <div
      className={cx('session-time-selector', {
        'session-time-selector--disabled': disabledTimerange,
      })}
    >
      <TimeSelector activity={activity.activity} route={route} hideTimerange />
      {disabledTimerange && (
        <div className="session-time-selector__alert">
          This feature is not supported by your current configuration.{' '}
          <a href="https://github.com/access-watch/access-watch/blob/master/docs/configuration.md">
            More infos
          </a>
        </div>
      )}
    </div>
  );
};

SessionTimeSelector.propTypes = {
  route: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool])
  ).isRequired,
  // cf : https://github.com/yannickcr/eslint-plugin-react/issues/1389
  /* eslint-disable react/no-typos */
  activity: activityPropType.isRequired,
  /* eslint-enable react/no-typos */
};

export default SessionTimeSelector;
