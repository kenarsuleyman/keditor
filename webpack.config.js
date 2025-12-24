const path = require('path');
const packageJson = require('./package.json');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const BANNER = `${packageJson.title} v${packageJson.version} | Copyright (c) 2016-present ${packageJson.author}`;

// Exporting as a function allows us to detect --mode production reliably
module.exports = (env, argv) => {

    // Check if we are in production mode
    const isProd = argv.mode === 'production';

    return {
        mode: isProd ? 'production' : 'development',

        // 'source-map' creates high-quality .map files for Production
        // 'eval-source-map' is faster for Development
        devtool: isProd ? 'source-map' : 'eval-source-map',

        entry: {
            'keditor': './src/keditor/index.js',
            'keditor-components': './src/components/index.js'
        },

        output: {
            path: path.resolve(__dirname, 'dist'),
            library: {
                type: 'umd',
                name: '[name]',
                export: 'default',
            },
            filename: `js/[name].js`,
            globalObject: 'this',
            clean: true,
        },

        optimization: {
            minimize: isProd,
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                }),
                new CssMinimizerPlugin(),
            ],
        },

        plugins: [
            new webpack.BannerPlugin(BANNER),
            new MiniCssExtractPlugin({
                filename: `css/[name].css`
            })
        ],

        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        },
                        {
                            loader: 'string-replace-loader',
                            options: {
                                multiple: [
                                    {
                                        search: '@{version}',
                                        replace: packageJson.version
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        // CSS Loader must have sourceMap: true
                        {
                            loader: 'css-loader',
                            options: { sourceMap: true }
                        },
                        // Sass Loader must have sourceMap: true
                        {
                            loader: 'sass-loader',
                            options: { sourceMap: true }
                        }
                    ],
                },
                {
                    test: /\.less$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: { sourceMap: true }
                        },
                        {
                            loader: 'less-loader',
                            options: { sourceMap: true }
                        }
                    ],
                }
            ]
        },

        externals: {
            jquery: 'jQuery',
            keditor: 'KEditor',
            ckeditor: 'CKEDITOR'
        },

        resolve: {
            modules: [path.resolve('./node_modules'), path.resolve('./src')],
            extensions: ['.json', '.js'],
            fallback: {
                "path": false,
                "fs": false
            }
        }
    };
};