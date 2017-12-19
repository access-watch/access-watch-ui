import React from 'react';
import Col from 'elemental/lib/components/Col';
import Row from 'elemental/lib/components/Row';
import cx from 'classnames';

import { V_SET_ROUTE, dispatch } from '../../event_hub';
import { updateRouteParameter } from '../../utilities/route_utils';
import { routePropType, robotsMetricsPropType } from '../prop_types';

import StyledNumber from '../utilities/styled_number';

import '../../../scss/robots_row_header.scss';

class RobotsRowHeader extends React.Component {
  static propTypes = {
    route: routePropType.isRequired,
    metrics: robotsMetricsPropType.isRequired,
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
    const { route, metrics } = this.props;
    const { reputation } = route;
    return (
      <div className="page-header__body">
        <Row gutter={0}>
          <Col md="16.66%">
            <div className="page-header-card">
              <div
                className={cx(
                  'page-header-card__value',
                  'page-header-card__value--robots'
                )}
              >
                {metrics.total ? (
                  <StyledNumber
                    value={metrics.total}
                    toLocaleStringOptions={{
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                  />
                ) : (
                  'n/a'
                )}
                <div
                  className={cx(
                    'page-header-card__sub-value',
                    'page-header-card__sub-value--robots'
                  )}
                >
                  requests by Robots
                </div>
              </div>
            </div>
          </Col>
          {['nice', 'ok', 'suspicious', 'bad'].map(rep => (
            <Col md="16.67%" key={rep}>
              <div className="page-header-card">
                <div
                  className={cx(
                    'page-header-card__value',
                    'page-header-card__value--robots',
                    'page-header-card__value--robot-rep'
                  )}
                >
                  <span
                    className="page-header-card__value--clickable"
                    onClick={_ => this.handleReputationClick(rep)}
                    onKeyPress={_ => this.handleReputationClick(rep)}
                  >
                    {metrics.status[rep] ? (
                      <span>
                        <StyledNumber
                          value={metrics.status[rep].percentage}
                          toLocaleStringOptions={{
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }}
                        />
                        %
                      </span>
                    ) : (
                      'n/a'
                    )}
                  </span>
                  <div
                    className={cx(
                      'page-header-card__sub-value',
                      'page-header-card__sub-value--robots',
                      'page-header-card__sub-value--robot-rep'
                    )}
                  >
                    <span className="checkbox-robots">
                      <div
                        onClick={_ => this.handleReputationClick(rep)}
                        onKeyPress={_ => this.handleReputationClick(rep)}
                        className="checkbox-robots--clickable"
                      >
                        <label
                          htmlFor={rep}
                          className={cx(
                            `checkbox-robots__checkbox checkbox-robots__checkbox--${rep}`,
                            {
                              'checkbox-robots__checkbox--checked':
                                reputation && reputation.includes(rep),
                            },
                            {
                              'checkbox-robots__checkbox--none-checked': !reputation,
                            }
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={
                              reputation ? reputation.includes(rep) : false
                            }
                            onChange={this.handleReputationChange}
                            ref={checkbox => {
                              this.reputations[rep] = checkbox;
                            }}
                            id={rep}
                          />
                        </label>
                        <span className="checkbox-robots__text">{rep}</span>
                      </div>
                    </span>
                  </div>
                </div>
              </div>
            </Col>
          ))}
          <Col md="16.66%" />
        </Row>
      </div>
    );
  }
}
export default RobotsRowHeader;
