import React from 'react';
import cx from 'classnames';

import { V_SET_ROUTE, dispatch } from '../../event_hub';
import { updateRouteParameter } from '../../utilities/route_utils';
import { capitalize } from '../../utilities/string';
import { supportsSessionsActivity } from '../../utilities/config';

import SVGIcon from '../utilities/svg_icon';
import { routePropType } from '../prop_types';

/* eslint-disable */
import TREEMAP_SVG from '!raw-loader!../../../assets/display-mode-treemap.svg';
import TABLE_SVG from '!raw-loader!../../../assets/display-mode-list.svg';
import ACTIVITY_SVG from '!raw-loader!../../../assets/display-mode-activity.svg';
/* eslint-enable */

import '../../../scss/sessions/sessions_visualisation_switch.scss';

const visualisationTypes = {
  treemap: TREEMAP_SVG,
  table: TABLE_SVG,
  activity: ACTIVITY_SVG,
};

const isSupportedDict = {
  treemap: () => true,
  table: () => true,
  activity: supportsSessionsActivity,
};

class SessionsVisualisationSwitch extends React.Component {
  static propTypes = {
    route: routePropType.isRequired,
  };

  switchVisualisation = value => {
    const { visType, route } = this.props.route;
    if (visType !== value) {
      dispatch({
        type: V_SET_ROUTE,
        route: updateRouteParameter({ route, param: 'visType', value }),
      });
    }
  };

  render() {
    const { visType } = this.props.route;
    return (
      <div className="sessions-visualisation-switch">
        {Object.keys(visualisationTypes).map(vis => (
          <SVGIcon
            key={vis}
            svg={visualisationTypes[vis]}
            alt={`${capitalize(vis)} icon`}
            onClick={_ => this.switchVisualisation(vis)}
            onKeyPress={_ => this.switchVisualisation(vis)}
            title={
              isSupportedDict[vis]()
                ? capitalize(vis)
                : 'Not supported by your configuration'
            }
            className={cx('sessions-visualisation-switch__icon', {
              'sessions-visualisation-switch__icon--active': vis === visType,
              'sessions-visualisation-switch__icon--disabled': !isSupportedDict[
                vis
              ](),
            })}
          />
        ))}
      </div>
    );
  }
}

export default SessionsVisualisationSwitch;
