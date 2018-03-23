import React from 'react';
import PropTypes from 'prop-types';

/* eslint-disable import/no-named-as-default */
import Dropdown from '../Dropdown';
import IntegrationPicker from '../IntegrationPicker';
/* eslint-enable import/no-named-as-default */
import { integrationPropType } from '../propTypes';

import './IntegrationManual.scss';

const IntegrationManual = ({
  site,
  integration,
  integrations,
  handleNewParams,
}) => (
  <div className="integration-manual">
    <h2 className="integration-manual__title">
      {'Integration manual for '}
      <img
        src={integration.logo}
        className="integration-manual__logo"
        alt={integration.name}
      />
      <Dropdown
        placeholder="switch"
        closeDropdownAction="onChange"
        className="integration-manual__integration-dropdown"
      >
        <IntegrationPicker
          onChange={handleNewParams}
          integrations={integrations}
          key="integrationPicker"
        />
      </Dropdown>
    </h2>
    <div className="integration-manual__steps">
      {/* eslint-disable react/no-array-index-key */
      integration.manual.steps.map((step, i) => (
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
      ))
      /* eslint-enable react/no-array-index-key */
      }
    </div>
  </div>
);

IntegrationManual.propTypes = {
  site: PropTypes.shape({
    key: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  integration: integrationPropType.isRequired,
  integrations: PropTypes.arrayOf(integrationPropType).isRequired,
  handleNewParams: PropTypes.func.isRequired,
};
export default IntegrationManual;
