const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const path = require('path');
const fs = require('fs');

const DIST_PATH = path.join(__dirname, 'dist');
const SRC_PATH = path.join(__dirname, 'src');

const PROD = process.env.NODE_ENV === 'production';
const STAGING = process.env.NODE_ENV === 'staging';

const babelConfig = (() => {
  const babelrc = JSON.parse(fs.readFileSync('./.babelrc'));
  // just a helper to put the complete path
  const resolvePaths = data => ({
    presets:
      data.presets &&
      data.presets.map(p => {
        if (Array.isArray(p)) {
          p[0] = require.resolve(p[0]);
        } else {
          p = require.resolve(p); //eslint-disable-line
        }
        return p;
      }),
    plugins: data.plugins && data.plugins.map(require.resolve),
  });

  return Object.assign(
    babelrc, // all the stuff from babelrc file
    {
      babelrc: false, // don't try to load the babelrc we
      cacheDirectory: true,
    },
    // override presets, plugins
    resolvePaths(babelrc),
    babelrc.env && {
      env: {
        // override again, if presets/plugins are availible under
        // `env.development` or `env.production`
        development: resolvePaths(babelrc.env.development),
        production: resolvePaths(babelrc.env.production),
      },
    }
  );
})();

const opts = {
  // hot module replacement
  // https://webpack.github.io/docs/hot-module-replacement.html
  hmr: !(STAGING || PROD),
  minify: PROD,
  env: {
    API_URL: JSON.stringify(process.env.API_URL),
    NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    WEBSOCKET_URI: JSON.stringify(process.env.WEBSOCKET_URI),
  },
  dev: JSON.stringify(!(PROD || STAGING)),
};

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    plugins: () => [
      require('autoprefixer'), //eslint-disable-line
    ],
  },
};

const sassLoader = {
  loader: 'sass-loader',
  options: {
    outputStyle: 'expanded',
    includePaths: [path.resolve(__dirname, 'node_modules')],
  },
};

const cssLoaderImportLoaders = {
  loader: 'css-loader',
  options: {
    minimize: opts.minify,
    importLoaders: 1,
  },
};

const cssLoader = {
  loader: 'css-loader',
  options: {
    minimize: opts.minify,
  },
};

const styleLoader = {
  loader: 'style-loader',
};

const mainEntry = [
  './node_modules/core-js/library/fn/object/assign', // Object.assign polyfill
  './node_modules/core-js/library/fn/string/includes', // String.prototype.includes polyfill
  'whatwg-fetch', // window.fetch polyfill
  './src/set-webpack-public-path', // allow dynamic public path
  `${SRC_PATH}/main.js`,
];

module.exports = {
  devtool: 'source-map',
  cache: !PROD,
  bail: PROD, // exit on first error
  entry: {
    main: mainEntry,
  },
  output: {
    path: DIST_PATH,
    filename: '[name].js', // re-use the key `entry` ^
    sourceMapFilename: '[file].map',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    enforceExtension: false,
    alias: {
      // transform `import 'rxjs'` -> `import '/src/rx'`
      rxjs$: path.resolve('./src/rx'),
      director$: path.resolve('./node_modules/director/build/director'),
    },
  },
  //resolveLoader: {
  //fallback: [path.resolve('./node_modules')]
  //},
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      // Inject globals
      __DEV__: opts.dev,
      'process.env': opts.env,
    }),
  ]
    .concat(
      opts.minify
        ? [
            //minify plugins
            new webpack.optimize.UglifyJsPlugin({
              sourceMap: !PROD,
              compress: {
                screw_ie8: true,
                warnings: false,
              },
              mangle: {
                screw_ie8: true,
              },
              output: {
                comments: false,
                screw_ie8: true,
              },
            }),
          ]
        : []
    )
    .concat(
      PROD
        ? [
            // production plugins
            new webpack.LoaderOptionsPlugin({
              minimize: true,
            }),
            new CleanWebpackPlugin([DIST_PATH], {
              verbose: true,
              exclude: [],
            }),
            new AssetsPlugin({
              prettyPrint: true,
              path: DIST_PATH,
            }),
          ]
        : []
    ),

  module: {
    rules: [
      {
        test: /\.jsx$/,
        use: ['source-map-loader'],
        enforce: 'pre',
      },
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'assets/[name].[hash:8].[ext]',
            },
          },
          {
            test: /\.jsx?$/,
            include: [
              path.resolve(__dirname, 'src'),
              /.*[/]/g.exec(require.resolve('access-watch-ui-components'))[0],
            ],
            use: {
              loader: 'babel-loader',
              query: babelConfig,
            },
          },
          {
            test: /\.css$/,
            use: [styleLoader, cssLoaderImportLoaders, postcssLoader],
          },
          {
            test: /\.scss$/,
            use: [
              styleLoader,
              cssLoaderImportLoaders,
              postcssLoader,
              sassLoader,
            ],
          },
          {
            test: /\.(eot|ttf|woff|woff2)$/,
            use: [
              {
                loader: 'file-loader',
                query: {
                  name: '[name].[ext]',
                  //useRelativePath: true
                },
              },
            ],
          },
        ],
      },
    ],
  },

  devServer: {
    contentBase: DIST_PATH,
    host: '0.0.0.0',

    // It suppress error shown in console, so it has to be set to false.
    quiet: false,
    // It suppress everything except error, so it has to be set to false as well
    // to see success build.
    noInfo: false,
    stats: {
      // Config for minimal console.log mess.
      assets: false,
      colors: true,
      version: false,
      hash: false,
      timings: true,
      chunks: true,
      chunkModules: false,
    },
  },
};
