import React from 'react';
import PropTypes from 'prop-types';
import END_LOGS_LOGO from '!raw-loader!../../../assets/end-of-logs.svg'; //eslint-disable-line
import SVGIcon from './svg_icon';

import '../../../scss/end.scss';

const End = ({ label }) => (
  <div className="end">
    <SVGIcon svg={END_LOGS_LOGO} />
    <div>{label}</div>
  </div>
);

End.propTypes = {
  label: PropTypes.string,
};

End.defaultProps = {
  label: '',
};

export default End;
