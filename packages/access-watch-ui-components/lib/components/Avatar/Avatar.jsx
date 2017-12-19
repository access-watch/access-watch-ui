import React from 'react';
import PropTypes from 'prop-types';

import './Avatar.scss';

const Avatar = ({photo, name, title}) => (
  <div className="avatar">
    <img className="avatar__img" src={photo} alt="avatar" />
    <div className="avatar__legend">
      <div className="avatar__name">
        {name}
      </div>
      <div className="avatar__role">
        {title}
      </div>
    </div>
  </div>
);

Avatar.propTypes = {
  photo: PropTypes.string,
  name: PropTypes.string,
  title: PropTypes.string,
};

export default Avatar;
