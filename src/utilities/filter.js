export const prefixFilter = prefix => ({ id, ...rest }) => ({
  id: prefix ? `${prefix}.${id}` : id,
  ...rest,
});
export const unfixFilter = prefix => ({ id, ...rest }) => ({
  id: prefix ? id.replace(`${prefix}.`, '') : id,
  ...rest,
});

export const filterToURI = ({ id, values, negative }) =>
  `${negative ? '-' : ''}${id}${
    values && values.length ? `:${values.join(',')}` : ''
  }`;
export const filtersToURI = filters => filters.map(filterToURI).join(';');
export const URIToFilter = uri => {
  const [id, ...values] = uri.split(':');
  const negative = id[0] === '-';
  return {
    id: negative ? id.slice(1) : id,
    ...(values.length ? { values: values.join(':').split(',') } : {}),
    exists: values.length === 0,
    negative,
  };
};
export const createURIToFilters = prefix => uri =>
  uri.length
    ? uri.split(';').map(f => unfixFilter(prefix)(URIToFilter(f)))
    : [];
