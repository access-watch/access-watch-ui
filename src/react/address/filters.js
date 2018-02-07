import { countries } from 'access-watch-ui-components';

import sessionFilters from '../sessions/filters';

export const addressesFilters = [
  {
    id: 'address.value',
  },
  {
    id: 'address.hostname',
  },
  {
    id: 'address.country_code',
    values: Object.keys(countries).filter(code => code.length === 2),
  },
  {
    id: 'address.network_name',
  },
  {
    id: 'address.as_number',
  },
];

export default [...addressesFilters, ...sessionFilters];
