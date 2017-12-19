import React from 'react';
import cx from 'classnames';

import { V_SET_ROUTE, dispatch } from '../../event_hub';
import { updateRouteParameter } from '../../utilities/route_utils';
import { capitalize } from '../../utilities/string';

import SVGIcon from '../utilities/svg_icon';
import { routePropType } from '../prop_types';

/* eslint-disable */
import TREEMAP_SVG from '!raw-loader!../../../assets/display-mode-treemap.svg';
import TABLE_SVG from '!raw-loader!../../../assets/display-mode-list.svg';
/* eslint-enable */

import '../../../scss/sessions/sessions_visualisation_switch.scss';

const visualisationTypes = {
  treemap: TREEMAP_SVG,
  table: TABLE_SVG,
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
            className={cx('sessions-visualisation-switch__icon', {
              'sessions-visualisation-switch__icon--active': vis === visType,
            })}
          />
        ))}
      </div>
    );
  }
}

export default SessionsVisualisationSwitch;
