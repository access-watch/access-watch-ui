import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { integrationPropType } from '../propTypes';

import './IntegrationPicker.scss';

class IntegrationPicker extends React.Component {
  static propTypes = {
    integrations: PropTypes.arrayOf(integrationPropType).isRequired,
    checkedIntegration: PropTypes.string,
    onChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    checkedIntegration: null,
  };

  constructor(props) {
    super(props);
    const { checkedIntegration } = this.props;

    this.state = {
      checkedIntegration,
    };
  }

  onIntegrationClick = integration => {
    this.setState({ checkedIntegration: integration }, _ => {
      this.props.onChange(this.state.checkedIntegration);
    });
  };

  render() {
    const { integrations } = this.props;
    const { checkedIntegration } = this.state;
    const integrationsByLanguage = integrations.reduce((acc, i) => {
      const { language } = i;
      if (!acc[language]) {
        acc[language] = [i];
      } else {
        acc[language].push(i);
      }
      return acc;
    }, {});

    return (
      <div className="integration-picker">
        {Object.keys(integrationsByLanguage).map(language => (
          <div className="integration-picker__language-stack" key={language}>
            {integrationsByLanguage[language].map(integration => (
              <button
                className={cx('integration-picker__item', {
                  'integration-picker__item--active':
                    checkedIntegration &&
                    integration.name === checkedIntegration.name,
                })}
                onClick={_ => this.onIntegrationClick(integration)}
                key={integration.name}
              >
                <img
                  src={integration.logo}
                  className="integration-picker__item__logo"
                  alt={`${integration.name} logo`}
                />
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  }
}

export default IntegrationPicker;
