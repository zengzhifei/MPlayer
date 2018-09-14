const PACKAGE = require('./package.json');
const PATH = require('path');
const WEBPACK = require('webpack');

module.exports = {
    mode: 'production',
    entry: {
        'MPlayer': './src/MPlayer.js'
    },
    output: {
        path: PATH.resolve(__dirname, 'dist'),
        filename: '[name].min.js',
        library: 'MPlayer',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components|test)/,
                include: PATH.resolve(__dirname, "src"),
                loader: 'babel'
            },
            {
                test: /\.json$/,
                exclude: /(node_modules|bower_components|test)/,
                loader: 'json'
            },
            {
                test: /\.html$/,
                include: PATH.resolve(__dirname, "src"),
                exclude: /(node_modules|bower_components|test)/,
                loader: 'html'
            },
            {
                test: /\.less$/,
                include: PATH.resolve(__dirname, "src"),
                exclude: /(node_modules|bower_components|test)/,
                loader: 'style!css!less'
            },
            {
                test: /\.(png|jpg|jpeg)$/,
                include: PATH.resolve(__dirname, "src"),
                exclude: /(node_modules|bower_components|test)/,
                loader: 'url'
            }
        ]
    },
    plugins: [
        new WEBPACK.BannerPlugin([
            'MPlayer v' + PACKAGE.version + ' [' + PACKAGE.homepage + ']',
            '@author ' + PACKAGE.author
        ].join('\n')),
        new WEBPACK.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
};