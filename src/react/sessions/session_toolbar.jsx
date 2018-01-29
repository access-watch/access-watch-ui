import React from 'react';
import cx from 'classnames';

import { V_SET_ROUTE, dispatch } from '../../event_hub';
import { updateRouteParameter } from '../../utilities/route_utils';
import { routePropType } from '../prop_types';
import SessionsVisualisationSwitch from './sessions_visualisation_switch';

import '../../../scss/sessions/session_toolbar.scss';

class SessionToolbar extends React.Component {
  static propTypes = {
    route: routePropType.isRequired,
  };

  // dom node refs
  reputations = {};

  handleReputationClick = rep => {
    this.reputations[rep].checked = !this.reputations[rep].checked;
    this.handleReputationChange();
  };

  handleReputationChange = _ => {
    const rep = Object.keys(this.reputations).filter(
      key => this.reputations[key].checked
    );
    const { route } = this.props.route;
    const value = rep.length > 0 ? rep.join(',') : false;
    dispatch({
      type: V_SET_ROUTE,
      route: updateRouteParameter({ route, param: 'reputation', value }),
    });
  };

  render() {
    const { route } = this.props;
    const { reputation } = route;
    return (
      <div className="session-toolbar">
        <div className="session-toolbar__checkboxes">
          {['nice', 'ok', 'suspicious', 'bad'].map(rep => (
            <div
              onClick={_ => this.handleReputationClick(rep)}
              onKeyPress={_ => this.handleReputationClick(rep)}
              className="session-toolbar__checkbox"
              key="rep"
            >
              <label
                htmlFor={rep}
                className={cx(
                  `session-toolbar__checkbox__checkbox session-toolbar__checkbox__checkbox--${rep}`,
                  {
                    'session-toolbar__checkbox__checkbox--checked':
                      reputation && reputation.includes(rep),
                  },
                  {
                    'session-toolbar__checkbox__checkbox--none-checked': !reputation,
                  }
                )}
              >
                <input
                  type="checkbox"
                  checked={reputation ? reputation.includes(rep) : false}
                  onChange={this.handleReputationChange}
                  ref={checkbox => {
                    this.reputations[rep] = checkbox;
                  }}
                  id={rep}
                />
              </label>
              <span className="session-toolbar__checkbox__text">{rep}</span>
            </div>
          ))}
        </div>
        <SessionsVisualisationSwitch route={route} />
      </div>
    );
  }
}
export default SessionToolbar;
