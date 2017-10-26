const path = require('path')
const ROOT_DIR = path.resolve(path.join(__dirname, '../../'))
const BIN_DIR = path.join(ROOT_DIR, 'bin')
const OUT_DIR = path.join(BIN_DIR, 'crextensionApi')
const devRequire = (n) => require(path.join(ROOT_DIR, 'node_modules', n))

const webpack = devRequire('webpack')
const MinifyPlugin = devRequire('babel-minify-webpack-plugin')
const CleanWebpackPlugin = devRequire('clean-webpack-plugin')
const CopyWebpackPlugin = devRequire('copy-webpack-plugin')
const WebpackNotifierPlugin = devRequire('webpack-notifier')

module.exports = function (env) {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    target: 'electron-renderer',
    devtool: isProduction ? undefined : (process.env.WEBPACK_DEVTOOL || 'source-map'),
    node: {
      __dirname: false,
      __filename: false
    },
    entry: {
      crextensionApi: [
        path.join(__dirname, 'src')
      ]
    },
    output: {
      path: OUT_DIR,
      filename: 'crextensionApi.js'
    },
    plugins: [
      !isProduction ? undefined : new webpack.DefinePlugin({
        __DEV__: false,
        'process.env.NODE_ENV': JSON.stringify('production')
      }),

      // Clean out our bin dir
      new CleanWebpackPlugin([path.relative(BIN_DIR, OUT_DIR)], {
        root: BIN_DIR,
        verbose: true,
        dry: false
      }),

      // Copy our static assets
      new CopyWebpackPlugin([
        { from: path.join(__dirname, '../../package.json'), to: 'package.json', force: true }
      ], {
        ignore: [ '.DS_Store' ]
      }),

      // Minify & optimization
      new webpack.optimize.ModuleConcatenationPlugin(),
      isProduction ? new MinifyPlugin({ simplify: false }, { sourceMap: false, comments: false }) : undefined,

      // Dev tools
      process.env.NOTIFICATIONS === 'true' ? new WebpackNotifierPlugin({ title: 'WB CRExtension API', alwaysNotify: true }) : undefined
    ].filter((p) => !!p),
    resolve: {
      extensions: ['.js', '.jsx', '.less', '.css'],
      alias: {
        Core: path.resolve(path.join(__dirname, 'src/Core')),
        Runtime: path.resolve(path.join(__dirname, 'src/Runtime')),
        Storage: path.resolve(path.join(__dirname, 'src/Storage')),
        Tabs: path.resolve(path.join(__dirname, 'src/Tabs')),
        WebRequest: path.resolve(path.join(__dirname, 'src/WebRequest')),
        shared: path.resolve(path.join(__dirname, '../shared')),
        electronCrx: path.resolve(path.join(__dirname, 'src/electronCrx')),
        R: path.resolve(path.join(__dirname, 'src')),
        'package.json': path.resolve(ROOT_DIR, 'package.json')
      },
      modules: [
        'node_modules',
        path.join(__dirname, 'node_modules'),
        __dirname,
        path.resolve(path.join(__dirname, 'src'))
      ]
    },
    module: {
      rules: [
        {
          test: /(\.jsx|\.js)$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                presets: [
                  [
                    'env', {
                      targets: { chrome: process.env.CHROME_TARGET },
                      modules: false,
                      loose: true
                    }
                  ],
                  'stage-0'
                ],
                plugins: ['transform-class-properties']
              }
            }
          ],
          exclude: /node_modules\//,
          include: [
            __dirname,
            path.resolve(path.join(__dirname, '../../shared'))
          ]
        },
        {
          test: /(\.less|\.css)$/,
          use: [ 'style-loader', 'css-loader', 'less-loader' ]
        }
      ]
    }
  }
}
