import React from 'react';
import PropTypes from 'prop-types';
import { Loader } from 'access-watch-ui-components';

import End from '../utilities/end';

export const TableResolversPropTypes = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    resolver: PropTypes.func,
  })
);

// TODO FIXME : For now RoundedTable doesn't support end and loading as we didn't have the need

export const TablePropTypes = {
  entries: PropTypes.array.isRequired,
  resolvers: TableResolversPropTypes.isRequired,
  onSortChange: PropTypes.func,
  currentSort: PropTypes.string,
  onEntryClick: PropTypes.func,
  rowClassResolver: PropTypes.func,
  onScrollNearBottom: PropTypes.func,
  end: PropTypes.bool,
  loadingMore: PropTypes.bool,
  loadingComponent: PropTypes.node,
  endComponent: PropTypes.node,
};

export const TableDefaultProps = {
  onSortChange: _ => _,
  currentSort: '',
  onEntryClick: _ => _,
  rowClassResolver: _ => '',
  onScrollReachBottom: _ => _,
  end: false,
  loadingMore: false,
  loadingComponent: <Loader />,
  endComponent: <End />,
};
