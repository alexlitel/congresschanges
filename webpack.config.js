const path = require('path')
const slsw = require('serverless-webpack')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  optimization: {
    minimize: false
  },
  devtool: false,
  externals: {
    canvas: {
      root: 'canvas',
      commonjs2: 'canvas',
      commonjs: 'canvas',
      amd: 'canvas'
    },
    'aws-sdk': {
      root: 'aws-sdk',
      commonjs2: 'aws-sdk',
      commonjs: 'aws-sdk',
      amd: 'aws-sdk'
    }
  },
  plugins: [
    new CopyPlugin([{ from: './src/static/fonts', to: './src/static/fonts' }])
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/env',
                  {
                    targets: {
                      node: '12.15.0'
                    }
                  }
                ]
              ]
            }
          }
        ]
      }
    ]
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
    sourceMapFilename: '[file].map'
  }
}
