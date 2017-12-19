import React from 'react';
import PropTypes from 'prop-types';

import Dropdown from '../Dropdown';
import IntegrationPicker from '../IntegrationPicker';

import './IntegrationManual.scss';

class IntegrationManual extends React.Component {
  static propTypes = {
    site: PropTypes.object,
    integration: PropTypes.object,
    integrations: PropTypes.array,
    handleNewParams: PropTypes.func
  }

  render() {
    const {site, integration, integrations, handleNewParams} = this.props;
    return (
      <div className="integration-manual">
        <h2 className="integration-manual__title">
          {'Integration manual for '}
          <img src={integration.logo} className="integration-manual__logo" alt={integration.name} />
          <Dropdown placeholder="switch" closeDropdownAction="onChange" className="integration-manual__integration-dropdown">
            <IntegrationPicker
              onChange={handleNewParams}
              integrations={integrations}
              key="integrationPicker"
            />
          </Dropdown>
        </h2>
        <div className="integration-manual__steps">
          {integration.manual.steps.map((step, i) => (
            <div key={i} className="integration-manual__step">
              <div className="integration-manual__step__title">
                <span className="integration-manual__step__num">
                  {`Step ${i + 1}`}
                </span>
                 - {step.title}
              </div>
              <div className="integration-manual__step__body">
                {step.body(site.key, site.url)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default IntegrationManual;
