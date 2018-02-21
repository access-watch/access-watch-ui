import React from 'react';

import SessionsVisualisationSwitch from './sessions_visualisation_switch';
import SmartFilter from '../filter/smart_filter';
import { routePropType } from '../prop_types';

const SessionsFilters = ({ route, ...filterProps }) => (
  <SmartFilter route={route} {...filterProps}>
    <SessionsVisualisationSwitch route={route} />
  </SmartFilter>
);

SessionsFilters.propTypes = {
  route: routePropType.isRequired,
};

export default SessionsFilters;
