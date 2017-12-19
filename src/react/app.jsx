import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import omit from 'blacklist';

import { capitalize } from '../utilities/string';

import TextTooltip from './utilities/text_tooltip';
import Tooltip from './utilities/tooltip';
import SVGIcon from './utilities/svg_icon';
import SidePanelComponent, { sidePanelPropTypes } from './side_panel';

import { V_SET_ROUTE, viewEvents } from '../event_hub';
import LOGO_RAW from '!raw-loader!../../assets/access-watch-nofill.svg'; //eslint-disable-line

import '../../scss/fonts.scss';
import '../../scss/main.scss';
import '../../scss/header.scss';

const navLinks = [
  {
    name: 'metrics',
  },
  {
    name: 'robots',
  },
  {
    name: 'addresses',
  },
  {
    name: 'requests',
  },
  {
    name: 'rules',
  },
];

const navigationLinkBaseClass = 'navigation__link';
const navigationLinkActiveClass = `${navigationLinkBaseClass}--active`;

/* eslint-disable react/prop-types */
const createRenderNavLink = activeRouteName => ({
  name,
  url = `#/${name}`,
  label = capitalize(name),
}) => (
  <li key={name}>
    <a
      href={url}
      className={cx(
        { [navigationLinkActiveClass]: activeRouteName === name },
        navigationLinkBaseClass
      )}
    >
      {label}
    </a>
  </li>
);
/* eslint-enable react/prop-types */

class App extends React.Component {
  handleNavigationLinkClicked = page => {
    viewEvents.emit(V_SET_ROUTE, { route: page });
  };

  render() {
    const { page, name, sidePanel } = this.props;
    const renderNavLink = createRenderNavLink(name);
    return (
      <div className="app">
        <div className="app__content">
          <header>
            <div className="header">
              <ul className="navigation">
                <li>
                  <a
                    className={cx(
                      { [navigationLinkActiveClass]: name === 'status' },
                      navigationLinkBaseClass,
                      `${navigationLinkBaseClass}--logo`
                    )}
                    href="#/status"
                  >
                    <SVGIcon
                      alt="logo"
                      svg={LOGO_RAW}
                      classSuffix="header-logo"
                    />
                  </a>
                </li>
                {navLinks.map(renderNavLink)}
              </ul>
            </div>
          </header>
          <div className={cx('page')}>{page}</div>
        </div>
        {sidePanel && (
          <SidePanelComponent {...omit(sidePanel, 'element')}>
            {sidePanel.element}
          </SidePanelComponent>
        )}
        <TextTooltip />
        <Tooltip />
      </div>
    );
  }
}

App.propTypes = {
  page: PropTypes.element.isRequired,
  name: PropTypes.string.isRequired,
  sidePanel: PropTypes.shape({
    ...omit(sidePanelPropTypes, 'children'),
    element: PropTypes.node.isRequired,
  }),
};

App.defaultProps = {
  sidePanel: null,
};

export default App;
