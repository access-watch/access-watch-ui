import React from 'react';
import END_LOGS_LOGO from '!raw-loader!../../../assets/end-of-logs.svg'; //eslint-disable-line
import SVGIcon from '../utilities/svg_icon';

const logEnd = () => (
  <div className="logs-end">
    <SVGIcon svg={END_LOGS_LOGO} />
    <div>End of logs</div>
  </div>
);

export default logEnd;
