/* eslint-disable no-underscore-dangle */

const domStringMap = (_ => {
  const tags = document.querySelectorAll('script');
  return tags.length ? tags[tags.length - 1].dataset : {};
})();

const data = Object.keys(domStringMap).reduce(
  (d, key) => ({
    ...d,
    [key]: domStringMap[key],
  }),
  {}
);

const config = Object.assign(
  {
    // Base url for assets
    assetBaseUrl: '',

    // `/asset` is appended by webpacks file-loader
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',

    websocket: process.env.WEBSOCKET_BASE_URL || 'ws://localhost:3000',
  },
  data
);

export default config;
