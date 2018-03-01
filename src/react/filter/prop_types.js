import PropTypes from 'prop-types';

const filterPropTypeShape = {
  id: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ),
};

const filterDefaultProps = {
  values: null,
};

const filterPropType = PropTypes.shape(filterPropTypeShape);

export const availableFilterPropType = PropTypes.shape({
  ...filterPropTypeShape,
  label: PropTypes.string,
  fullText: PropTypes.bool,
  valueToLabel: PropTypes.func,
});

const availableFilterDefaultProps = {
  ...filterDefaultProps,
  label: null,
  fullText: false,
  valueToLabel: v => v,
};

export const filtersPropType = {
  filters: PropTypes.arrayOf(filterPropType),
  availableFilters: PropTypes.arrayOf(availableFilterPropType),
};

export const filtersDefaultProps = {
  filters: filterDefaultProps,
  availableFilters: availableFilterDefaultProps,
};
