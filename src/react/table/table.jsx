import React from 'react';
import cx from 'classnames';

import { capitalize } from '../../utilities/string';

import { TablePropTypes, TableDefaultProps } from './prop_types';
import NearPageBottom from '../utilities/near_page_bottom';

import '../../../scss/table.scss';

const cModifier = (cn, sfx) => `${cn}--${sfx}`;

const headerCellClass = 'aw-table__header__cell';

const tryResolver = ({ resolver, id, entry }) => {
  const result = resolver(entry);
  if (!result && typeof result !== 'string') {
    // eslint-disable-next-line
    console.warn(
      'Table Warning, could not resolve property ' + id + ' for entry ',
      entry
    );
    return '';
  }
  return result;
};

const Table = ({
  entries,
  resolvers,
  onSortChange,
  currentSort,
  onEntryClick,
  rowClassResolver,
  onScrollNearBottom,
  end,
  loadingMore,
  loadingComponent,
  endComponent,
}) => (
  <NearPageBottom onScrollNearBottom={onScrollNearBottom}>
    {() => (
      <table className="aw-table">
        <thead className="aw-table__header">
          <tr className="aw-table__header__row">
            {resolvers.map(({ id, label = capitalize(id), sortable }) => (
              <th
                key={id}
                className={cx(
                  headerCellClass,
                  cModifier(headerCellClass, id),
                  { [cModifier(headerCellClass, 'sortable')]: sortable },
                  {
                    [cModifier(headerCellClass, 'sorted')]:
                      sortable && currentSort === id,
                  }
                )}
                onClick={() => {
                  if (onSortChange && sortable) {
                    onSortChange(id);
                  }
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr
              key={entry.id}
              className={cx(
                'aw-table__body__row',
                { 'aw-table__body__row--clickable': onEntryClick },
                rowClassResolver(entry)
              )}
              onClick={() => onEntryClick(entry.id)}
            >
              {resolvers.map(
                ({ id, resolver = e => e[id], classResolver = () => '' }) => (
                  <td
                    key={id}
                    className={`aw-table__body__cell aw-table__body__cell--${id} ${classResolver(
                      entry
                    )}`}
                  >
                    {tryResolver({ id, resolver, entry })}
                  </td>
                )
              )}
            </tr>
          ))}
          {(loadingMore || end) && (
            <tr>
              <td
                colSpan={resolvers.length}
                className="aw-table__body__last-row"
              >
                {loadingMore ? loadingComponent : endComponent}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    )}
  </NearPageBottom>
);

Table.propTypes = TablePropTypes;

Table.defaultProps = TableDefaultProps;

export default Table;
