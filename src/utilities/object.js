const upperCaseUnderscores = s =>
  s.replace(/_([\d\w])/g, (_, l) => l.toUpperCase());

export const convertBackendKeys = obj =>
  Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      [upperCaseUnderscores(key)]: obj[key],
    }),
    {}
  );

// pick keys from object, omitting the rest
export const pickKeys = keys => obj =>
  keys.reduce(
    (acc, key) => ({
      ...acc,
      ...(obj[key] && { [key]: obj[key] }),
    }),
    {}
  );

// renames is an object with the shape of {oldKey: 'newKey', etc...}
export const renameKeys = renames => obj =>
  Object.keys(renames).reduce(
    (acc, from) => {
      acc[renames[from]] = acc[from];
      delete acc[from];
      return acc;
    },
    { ...obj }
  );

export const ObjectPropertiesEqual = (a, b) => {
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  return (
    keysA.length === keysB.length &&
    keysA.reduce(
      (diff, k) => diff && keysB.indexOf(k) !== -1 && a[k] === b[k],
      true
    )
  );
};

export const convertObjValues = fn => obj =>
  Object.keys(obj).reduce(
    (acc, key) => ({
      [key]: fn(obj[key]),
      ...acc,
    }),
    {}
  );

export const convertObjKeyValues = ({ keys, convertFn }) => o => ({
  ...o,
  ...convertObjValues(convertFn)(pickKeys(keys)(o)),
});
