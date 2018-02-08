import { countries } from 'access-watch-ui-components';

import sessionFilters from '../sessions/filters';

export const addressesFilters = [
  {
    id: 'value',
  },
  {
    id: 'hostname',
  },
  {
    id: 'country_code',
    values: Object.keys(countries).filter(code => code.length === 2),
  },
  {
    id: 'network_name',
  },
  {
    id: 'as_number',
  },
];

export default [...addressesFilters, ...sessionFilters];
