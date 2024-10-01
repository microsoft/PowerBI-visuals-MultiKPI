const path = require('path');
const webpack = require("webpack");

module.exports = {
    devtool: 'inline-source-map',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /(dist|coverage|karma.conf.ts)/
            },
            {
                test: /\.ts$/i,
                enforce: 'post',
                include: /(src)/,
                exclude: /(node_modules|resources\/js\/vendor)/,
                loader: 'coverage-istanbul-loader',
                options: { esModules: true }
            },
            {
                test: /\.less$/,
                use: [{
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            lessOptions: {
                               paths: [path.resolve(__dirname, 'node_modules')] 
                            } 
                        }
                    }
                ]
            }
        ]
    },
    externals: {
        "powerbi-visuals-api": '{}'
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.css']
    },
    output: {
        path: path.resolve(__dirname, ".tmp")
    },
    plugins: [
        new webpack.ProvidePlugin({
            'powerbi-visuals-api': null
        }),
    ],
};
