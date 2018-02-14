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

const windowConfig = {
  time: {
    sliderValues: ['auto', 30, 60, 360, 1440],
  },
  metrics: {
    expiration: 24 * 3600,
  },
  session: {
    timerange: true,
  },
  ...(window.config || {}),
};

const config = Object.assign(
  {
    // Base url for assets
    assetBaseUrl: '',

    // `/asset` is appended by webpacks file-loader
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',

    websocket: process.env.WEBSOCKET_BASE_URL || 'ws://localhost:3000',
  },
  windowConfig,
  data
);

export default config;
