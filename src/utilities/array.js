// eslint-disable-next-line import/prefer-default-export
export const arrayValuesEquals = (a, b) => {
  if (a.length === b.length) {
    return a.reduce((bool, cur, i) => bool && cur === b[i], true);
  }
  return false;
};
