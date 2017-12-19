import React from 'react';
import omit from 'blacklist';
import cx from 'classnames';

import { capitalize } from '../../utilities/string';

import { TablePropTypes, TableDefaultProps } from './prop_types';

import '../../../scss/rounded_table.scss';

// NB: this class does not provide sorting for now
const banProps = ['onSortChange', 'currentSort'];

const createClassWithSuffix = (cn, suffixes) =>
  [cn, suffixes.map(s => `${cn}--${s}`)].join(' ');

// Had to disable next line as eslint is not capable of resolving the omit
/* eslint-disable react/prop-types */
const RoundedTable = ({
  entries,
  resolvers,
  onEntryClick,
  rowClassResolver,
}) => (
  /* eslint-enable react/prop-types */
  <div className="rounded-table">
    <div className="rounded-table__header">
      {resolvers.map(({ id, label = capitalize(id) }) => (
        <div
          className={createClassWithSuffix('rounded-table__header__cell', [id])}
          key={id}
        >
          {label}
        </div>
      ))}
    </div>
    <div className="rounded-table__body">
      {entries.map(entry => (
        <div
          className={cx('rounded-table__body__row', rowClassResolver(entry))}
          key={entry.id}
        >
          {resolvers.map(({ id, resolver }) => (
            <div
              className={createClassWithSuffix('rounded-table__body__cell', [
                id,
              ])}
              key={id}
              onClick={() => onEntryClick(entry.id)}
              onKeyPress={() => onEntryClick(entry.id)}
            >
              {resolver ? resolver(entry) : entry[id]}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

RoundedTable.propTypes = omit(TablePropTypes, ...banProps);

RoundedTable.defaultProps = omit(TableDefaultProps, ...banProps);

export default RoundedTable;
