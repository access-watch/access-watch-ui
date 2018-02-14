import PropTypes from 'prop-types';

const filterPropTypesShape = {
  id: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(
    PropTypes.oneOfType(PropTypes.number, PropTypes.string)
  ),
};

const filterDefaultProps = {
  values: null,
};

const filterPropTypes = PropTypes.shape(filterPropTypesShape);

const availableFiltersPropTypes = PropTypes.shape({
  ...filterPropTypesShape,
  label: PropTypes.string,
  fullText: PropTypes.bool,
  valueToLabel: PropTypes.func,
});

const availableFiltersDefaultProps = {
  ...filterDefaultProps,
  label: null,
  fullText: false,
  valueToLabel: v => v,
};

export const filtersPropTypes = {
  filters: filterPropTypes,
  availableFilters: availableFiltersPropTypes,
};

export const filtersDefaultProps = {
  filters: filterDefaultProps,
  availableFilters: availableFiltersDefaultProps,
};

export default {
  filters: PropTypes.shape(),
};
