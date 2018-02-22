export const prefixFilter = prefix => ({ id, ...rest }) => ({
  id: prefix ? `${prefix}.${id}` : id,
  ...rest,
});
export const unfixFilter = prefix => ({ id, ...rest }) => ({
  id: prefix ? id.replace(`${prefix}.`, '') : id,
  ...rest,
});

export const filterToURI = ({ id, values = [] }) => `${id}:${values.join(',')}`;
export const filtersToURI = filters => filters.map(filterToURI).join(';');
export const URIToFilter = uri => {
  const [id, valuesURI] = uri.split(':');
  const values = valuesURI ? valuesURI.split(',') : [];
  return {
    id,
    values,
  };
};
export const createURIToFilters = prefix => uri =>
  uri.length
    ? uri.split(';').map(f => unfixFilter(prefix)(URIToFilter(f)))
    : [];
