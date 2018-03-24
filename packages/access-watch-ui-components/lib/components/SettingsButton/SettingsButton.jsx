import React from 'react';
import PropTypes from 'prop-types';

import { fetchGravatarPicture } from './gravatar';

/* eslint-disable import/no-named-as-default */
import Dropdown from '../Dropdown';
import Avatar from '../Avatar';
/* eslint-enable import/no-named-as-default */

import defaultAvatarPhoto from './astronaut-128x128.png';
import './SettingsButton.scss';

export default class SettingsButton extends React.Component {
  static propTypes = {
    fullname: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    emailHash: PropTypes.string.isRequired,
    hidePhoto: PropTypes.bool,
    actions: PropTypes.objectOf(
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        action: PropTypes.func.isRequired,
      })
    ).isRequired,
    className: PropTypes.string,
  };

  static defaultProps = {
    hidePhoto: false,
    className: '',
  };

  state = { dropdownOpen: false };

  componentDidMount() {
    const { emailHash } = this.props;
    fetchGravatarPicture({ hash: emailHash, d: defaultAvatarPhoto }).then(
      photo => {
        this.setState({ photo });
      }
    );
  }

  componentWillReceiveProps({ emailHash }) {
    if (emailHash !== this.props.emailHash) {
      fetchGravatarPicture({ hash: emailHash, d: defaultAvatarPhoto }).then(
        photo => {
          this.setState({ photo });
        }
      );
    }
  }

  handleAction = action => _ => {
    this.setState({ dropdownOpen: false });
    action();
  };

  handleDropdownStateChange = dropdownOpen => {
    this.setState({ dropdownOpen });
  };

  render() {
    const { fullname, email, hidePhoto, actions, className } = this.props;
    const { dropdownOpen } = this.state;
    const { photo } = this.state;
    const avatar = {
      name: fullname,
      title: email,
      photo,
    };
    const buttonStyle =
      photo && !hidePhoto ? { backgroundImage: `url(${photo})` } : {};
    return (
      <div className={`settings-button ${className}`}>
        <Dropdown
          select={false}
          buttonStyle={buttonStyle}
          open={dropdownOpen}
          onDropdownStateChange={this.handleDropdownStateChange}
        >
          <div className="settings-button__profile">
            <Avatar {...avatar} />
          </div>
          <div className="settings-button__actions">
            {Object.keys(actions).map(key => {
              const setting = actions[key];
              return (
                <button
                  key={key}
                  onClick={this.handleAction(setting.action)}
                  className={`settings-button__action settings-button__action--${key}`}
                >
                  {setting.text}
                </button>
              );
            })}
          </div>
        </Dropdown>
      </div>
    );
  }
}
