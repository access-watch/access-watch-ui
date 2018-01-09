import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { V_SHOW_TEXT_TOOLTIP, dispatch } from '../../event_hub';
import SVGIcon from '../utilities/svg_icon';
import { formatDateAndTime, formatOnlyHour } from '../../i18n';

import IdentityTableCell from '../sessions/identity_table_cell';
import { logPropType } from '../prop_types';
import AddressLabel from '../address/address_label';

const handleHover = e => {
  // attach the tooltip to the table cell to get it properly centered
  const t = (() => {
    let n = e.target;
    while (n.nodeName !== 'TD') {
      n = n.parentNode;
    }
    return n;
  })();

  // some extra px for margin
  if (
    e.currentTarget.getBoundingClientRect().width + 20 >
    t.getBoundingClientRect().width
  ) {
    // looks like the text overflows, so show tooltip
    dispatch({
      type: V_SHOW_TEXT_TOOLTIP,
      node: t,
      message: <span>{t.innerText}</span>,
    });
  }
};

// some special column with additional data or functionality.
const columnValue = {
  updated: entry => formatDateAndTime(entry.updated),
  time: entry => formatDateAndTime(entry.request.time),
  timeH: entry => formatOnlyHour(entry.request.time),

  // eslint-disable-next-line
  'address.label': ({ address, countryCode, country }) => (
    <AddressLabel
      onMouseEnter={handleHover}
      address={{
        ...address,
        countryCode,
        country,
      }}
    />
  ),

  // eslint-disable-next-line react/prop-types
  'request.host': ({ request = {} }) => (
    <span> {request.headers && request.headers.host} </span>
  ),

  'request.url': entry => (
    <span onMouseEnter={handleHover}>{entry.request.url}</span>
  ),

  'reputation.preview': _ => <span />,

  'identity.label': entry => <span>{entry.identity.label}</span>,

  'identity.combined': entry => {
    const combinedIdentity =
      (entry.robot && entry.robot.name) ||
      entry.identity.name ||
      entry.identity.label;
    const shouldDisplayUaLabel =
      !combinedIdentity || combinedIdentity === entry.identity.label;
    const uaLabel =
      entry.user_agent &&
      entry.user_agent.agent &&
      entry.user_agent.agent.label;
    return (
      <span>
        {combinedIdentity && (
          <span className="logs__col--identity-combined__identity">
            {combinedIdentity}
          </span>
        )}
        {shouldDisplayUaLabel &&
          uaLabel && (
            <span className="logs__col--identity-combined__user-agent">
              {combinedIdentity && ' - '}
              {uaLabel}
            </span>
          )}
      </span>
    );
  },

  'user_agent.agent.label': entry => (
    <span onMouseEnter={handleHover}>
      {entry.agentIcon && (
        <SVGIcon svg={entry.agentIcon} className="logs__agent-icon" />
      )}
      {(entry.user_agent &&
        entry.user_agent.agent &&
        entry.user_agent.agent.label) ||
        'Unknown'}
    </span>
  ),
  // eslint-disable-next-line
  identity: ({ robot, reputation, user_agent: ua }) => (
    <IdentityTableCell robot={robot} reputation={reputation} user_agent={ua} />
  ),
};

const rowBaseClass = 'logs__row';
const rowClassResolver = entry => {
  const suffix =
    entry.identity && entry.identity.type === 'browser'
      ? 'browser'
      : entry && entry.reputation.status;
  return `${rowBaseClass} ${rowBaseClass}--${suffix}`;
};

export default class LogsRow extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    className: PropTypes.string,

    // The log entry to render
    entry: logPropType.isRequired,

    // Object for what value to render from `entry` with the label as value
    columns: PropTypes.objectOf(PropTypes.string).isRequired,
    rowHeight: PropTypes.number.isRequired,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    onClick: _ => _,
  };

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.id !== this.props.id ||
      this.props.className !== nextProps.className
    );
  }

  handleClick = _ => {
    const { onClick, entry } = this.props;

    if (onClick) {
      onClick(entry);
    }
  };

  render() {
    const { entry, columns, rowHeight } = this.props;

    return (
      <tr
        className={cx(rowClassResolver(entry), this.props.className)}
        style={{ height: rowHeight }}
        onClick={this.handleClick}
      >
        {Object.keys(columns).map(key => (
          <td
            key={key}
            className={cx(
              'logs__col',
              `logs__col--${key.replace('.', '-')}`,
              {
                [`logs__col--${key.replace('.', '-')}--${entry.reputation &&
                  entry.reputation.status}`]: entry.reputation,
              },
              {
                [`logs__col--${key.replace('.', '-')}--${entry.identity &&
                  entry.identity.type}`]: entry.identity,
              }
            )}
          >
            {// when a key is found in `columnValue`, use that to render the column
            // otherwise just the plain value
            columnValue[key]
              ? columnValue[key](entry)
              : key.split('.').reduce((acc, el) => acc && acc[el], entry)}
          </td>
        ))}
      </tr>
    );
  }
}
