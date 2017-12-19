import React from 'react';
import PropTypes from 'prop-types';

import {fetchGravatarPicture} from './gravatar';

import Dropdown from '../Dropdown';
import Avatar from '../Avatar';

import defaultAvatarPhoto from './astronaut-128x128.png';
import './SettingsButton.scss';

export default class SettingsButton extends React.Component {
  static propTypes = {
    fullname: PropTypes.string,
    email: PropTypes.string,
    emailHash: PropTypes.string,
    hidePhoto: PropTypes.bool,
    actions: PropTypes.object,
    className: PropTypes.string,
  }

  state = {dropdownOpen: false}

  componentDidMount() {
    const {emailHash} = this.props;
    fetchGravatarPicture({hash: emailHash, d: defaultAvatarPhoto}).then(
      photo => { this.setState({photo}); }
    );
  }

  componentWillReceiveProps({emailHash}) {
    if (emailHash !== this.props.emailHash) {
      fetchGravatarPicture({hash: emailHash, d: defaultAvatarPhoto}).then(
        photo => { this.setState({photo}); }
      );
    }
  }

  handleAction = action => _ => {
    this.setState({dropdownOpen: false});
    action();
  }

  handleDropdownStateChange = dropdownOpen => {
    this.setState({dropdownOpen});
  }

  render() {
    const {fullname, email, hidePhoto, actions, className} = this.props;
    const {dropdownOpen} = this.state;
    const photo = this.state.photo;
    const avatar = {
      name: fullname,
      title: email,
      photo
    };
    const buttonStyle = photo && !hidePhoto ? { backgroundImage: `url(${photo})` } : {};
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
            {Object.keys(actions)
              .map(key => {
                const setting = actions[key];
                return (
                  <div
                    key={key}
                    onClick={this.handleAction(setting.action)}
                    className={`settings-button__action settings-button__action--${key}`}
                  >
                    {setting.text}
                  </div>
                );
              })}
          </div>
        </Dropdown>
      </div>
    );
  }
}
