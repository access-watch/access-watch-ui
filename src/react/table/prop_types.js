import PropTypes from 'prop-types';

export const TableResolversPropTypes = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    resolver: PropTypes.func,
  })
);

export const TablePropTypes = {
  entries: PropTypes.array.isRequired,
  resolvers: TableResolversPropTypes.isRequired,
  onSortChange: PropTypes.func,
  currentSort: PropTypes.string,
  onEntryClick: PropTypes.func,
  rowClassResolver: PropTypes.func,
};

export const TableDefaultProps = {
  onSortChange: _ => _,
  currentSort: '',
  onEntryClick: _ => _,
  rowClassResolver: _ => '',
};
