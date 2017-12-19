const equalityReducer = (d1, d2, comparators) =>
  comparators.reduce((eq, compFn) => eq && d1[compFn]() === d2[compFn](), true);

const getDateWithCompReducer = (date, comparators) =>
  new Date(
    ...comparators.reduce((dateArr, comp) => [...dateArr, date[comp]()], [])
  );

export const dayComparators = ['getFullYear', 'getMonth', 'getDate'];
export const dayEquality = (d1, d2) => equalityReducer(d1, d2, dayComparators);
export const getPureDayFromDate = date =>
  getDateWithCompReducer(date, dayComparators);
