import PropTypes from 'prop-types';

// eslint-disable-next-line import/prefer-default-export
export const integrationPropType = PropTypes.shape({
  logo: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
});
