const webpack = require("webpack");

module.exports = function override(config){
    const fallback = config.resolve.fallback || {};

    Object.assign(fallback, {
        zlib: require.resolve("browserify-zlib"),
        querystring: require.resolve("querystring-es3"),
        path: require.resolve("path-browserify"),
        fs: false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        http: require.resolve("stream-http"),
        net: false,
        module: false, 
        dns: false,
        tls: false,
        'process/browser': require.resolve("process/browser"),
        buffer: require.resolve("buffer"),
        vm: require.resolve("vm-browserify"),
    });
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process:'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    ]);

    return config;
};