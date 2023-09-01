/* eslint-disable no-undef */
const { resolve } = require('path');
const webpack = require('webpack');

module.exports = function override(config, env) {
    // do stuff with the webpack config...
    config.resolve.alias = {
        '@': resolve(__dirname, 'src'),
    };

    config.resolve.fallback = {
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        os: require.resolve('os-browserify/browser'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
    };
    const plugin = new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    });

    config.plugins.unshift(plugin);

    config.plugins.unshift(
        new webpack.ProvidePlugin({
            process: 'process/browser',
        })
    );

    config.module.rules.push({
        test: /\.m?js/,
        resolve: {
            fullySpecified: false,
        },
    });

    return config;
};
