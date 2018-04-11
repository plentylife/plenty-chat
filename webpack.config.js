const webpack = require('webpack') // to access built-in plugins
var path = require('path')

const common = {
  module: {
    rules: [
      // {
      //   enforce: 'pre',
      //   test: /\.jsx?$/,
      //   include: [
      //     path.resolve(__dirname, 'src'),
      //     path.resolve(__dirname, 'test')
      //   ],
      //   exclude: /(node_modules|build-module|build-test)/,
      //   loader: 'eslint-loader',
      //   options: {
      //     // eslint options (if necessary)
      //   }
      // },
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test')
        ],
        exclude: /(node_modules|bower_components|build)/,
        loader: 'babel-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      React: 'react'
    }
  }
}

const library = Object.assign({}, common, {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'build-module'),
    filename: 'index.js',
    libraryTarget: 'umd' // THIS IS THE MOST IMPORTANT LINE! :mindblow: I wasted more than 2 days until realize this was the line most important in all this guide.
  },
  externals: {
    'react': 'commonjs react' // this line is just to use the React dependency of our parent-testing-project instead of using our own React.
  }
})

const visualTests = Object.assign({}, common, {
  entry: './test/visualTests.jsx',
  output: {
    path: path.resolve(__dirname, 'build-tests'),
    filename: 'visualTests.js'
  },
  target: 'web',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      },
      'DB_MODE': JSON.stringify('TEMP')
    })
  ],
  devtool: 'inline-source-map'
})

module.exports = [
  library, visualTests
]
