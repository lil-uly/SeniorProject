const webpack = require("webpack");

module.exports = function override(config) {
    config.resolve = {
        ...config.resolve,
        fallback: {
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
            vm: require.resolve("vm-browserify"),
        },
    };

    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: "process",
            Buffer: ["buffer", "Buffer"],
        }),
    ]);

    return config;
};