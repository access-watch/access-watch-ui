import React from 'react';
import PropTypes from 'prop-types';
import { formatDate } from '../../i18n';

const LogsSeparator = ({ date, height, columnsLength }) => (
  <tr
    className="logs-row__separator__tr"
    key={`separator-${date.toString()}`}
    style={{ height }}
  >
    <td className="logs-row__separator__td" colSpan={columnsLength}>
      {formatDate(date)}
    </td>
  </tr>
);

LogsSeparator.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  height: PropTypes.number.isRequired,
  columnsLength: PropTypes.number.isRequired,
};

export default LogsSeparator;
