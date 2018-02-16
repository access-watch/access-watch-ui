import PropTypes from 'prop-types';

const filterPropTypesShape = {
  id: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ),
};

const filterDefaultProps = {
  values: null,
};

const filterPropTypes = PropTypes.shape(filterPropTypesShape);

const availableFilterPropTypes = PropTypes.shape({
  ...filterPropTypesShape,
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

export const filtersPropTypes = {
  filters: PropTypes.arrayOf(filterPropTypes),
  availableFilters: PropTypes.arrayOf(availableFilterPropTypes),
};

export const filtersDefaultProps = {
  filters: filterDefaultProps,
  availableFilters: availableFilterDefaultProps,
};

export default {
  filters: PropTypes.shape(),
};
