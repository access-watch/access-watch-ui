// dynamically setting publicPath for our assets
// see https://webpack.github.io/docs/configuration.html#output-publicpath

import config from './app_config';

__webpack_public_path__ = config.assetBaseUrl; //eslint-disable-line
