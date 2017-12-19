// Remove the eslint-disable if this file has more exports
/* eslint-disable import/prefer-default-export */
export const capitalize = word =>
  word.length > 0 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '';
