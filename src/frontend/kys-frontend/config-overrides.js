const { override, addWebpackAlias, addWebpackPlugin } = require('customize-cra');
const webpack = require('webpack');

module.exports = override(
  addWebpackAlias({
    'http': require.resolve('stream-http'),
    'https': require.resolve('https-browserify'),
    'url': require.resolve('url/'),
    'stream': require.resolve('stream-browserify'),
    'assert': require.resolve('assert/'),
    'util': require.resolve('util/'),
    'zlib': require.resolve('browserify-zlib'),
    'buffer': require.resolve('buffer/'),
  }),
  (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'process': require.resolve('process/browser.js'),
      'buffer': require.resolve('buffer/'),
      'http': require.resolve('stream-http'),
      'https': require.resolve('https-browserify'),
      'url': require.resolve('url/'),
      'stream': require.resolve('stream-browserify'),
      'assert': require.resolve('assert/'),
      'util': require.resolve('util/'),
      'zlib': require.resolve('browserify-zlib'),
    };
    config.resolve.extensions = [
      ...(config.resolve.extensions || []),
      '.js', '.json', '.mjs'
    ];
    return config;
  },
  addWebpackPlugin(
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    })
  )
); 