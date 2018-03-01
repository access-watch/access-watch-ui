import React from 'react';

import SessionsVisualisationSwitch from './sessions_visualisation_switch';
import Filters from '../filter/filters';
import { routePropType } from '../prop_types';

const SessionsFilters = ({ route, ...filterProps }) => (
  <Filters route={route} {...filterProps}>
    <SessionsVisualisationSwitch route={route} />
  </Filters>
);

SessionsFilters.propTypes = {
  route: routePropType.isRequired,
};

export default SessionsFilters;
