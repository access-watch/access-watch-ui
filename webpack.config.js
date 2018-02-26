const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const path = require('path');

const DIST_PATH = path.join(__dirname, 'dist');
const SRC_PATH = path.join(__dirname, 'src');

const PROD = process.env.NODE_ENV === 'production';
const STAGING = process.env.NODE_ENV === 'staging';

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
  mode: PROD ? 'production' : 'development',
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
              /.*[/]/g.exec(require.resolve('access-watch-sdk'))[0],
            ],
            use: {
              loader: 'babel-loader',
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
