export const pickKeys = keys => obj =>
  keys.reduce(
    (acc, key) => ({
      ...acc,
      ...(key && keys.indexOf(key) !== -1
        ? {
            [key]: obj[key],
          }
        : {}),
    }),
    {}
  );

export const omitKeys = keys => obj =>
  pickKeys(Object.keys(obj).filter(key => keys.indexOf(key) === -1))(obj);
