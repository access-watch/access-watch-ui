export const prefixFilter = prefix => ({ id, ...rest }) => ({
  id: prefix ? `${prefix}.${id}` : id,
  ...rest,
});
export const unfixFilter = prefix => ({ id, ...rest }) => ({
  id: prefix ? id.replace(`${prefix}.`, '') : id,
  ...rest,
});

export const filterToURI = ({ id, values = [], negative }) =>
  `${negative ? '-' : ''}${id}:${values.join(',')}`;
export const filtersToURI = filters => filters.map(filterToURI).join(';');
export const URIToFilter = uri => {
  const [id, ...valuesURI] = uri.split(':');
  const values = valuesURI.length ? valuesURI.join(':').split(',') : [];
  const negative = id[0] === '-';
  return {
    id: negative ? id.slice(1) : id,
    values,
    negative,
  };
};
export const createURIToFilters = prefix => uri =>
  uri.length
    ? uri.split(';').map(f => unfixFilter(prefix)(URIToFilter(f)))
    : [];
