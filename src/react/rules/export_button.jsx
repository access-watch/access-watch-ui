import React from 'react';
import PropTypes from 'prop-types';

import Button from '../utilities/button';
import config from '../../app_config';

import '../../../scss/rules/export_button.scss';

const noop = _ => _;

const ExportButton = ({ id, ...props }) => (
  <Button onClick={noop} className="export-button" {...props}>
    <a href={`${config.apiBaseUrl}/rules/export/${id}`} download>
      {id}
    </a>
  </Button>
);

ExportButton.propTypes = {
  id: PropTypes.string.isRequired,
};

export default ExportButton;
