const webpackSelection = require('./webpack-build-selector')

const webpack = require('webpack') // to access built-in plugins
var path = require('path')
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const CircularDependencyPlugin = require('circular-dependency-plugin')

const common = {
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test')
        ],
        exclude: /(node_modules|build-module|build-test)/,
        loader: 'eslint-loader',
        options: {
          // eslint options (if necessary)
        }
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.scss/,
        use: [ 'style-loader', 'css-loader', 'sass-loader' ]
      },
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test'),
          // path.resolve(__dirname, 'node_modules/nano-sql')
        ],
        exclude: /(node_modules|bower_components|build)/,
        loader: 'babel-loader'
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      },
      {
        test: /\.(png|jp(e*)g|svg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 15000, // Convert images < 8kb to base64 strings
            name: 'images/[hash]-[name].[ext]'
          }
        }]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      React: 'react'
    },
    modules: [
      path.resolve('./src/components'),
      // path.resolve('./src/db'),
      // path.resolve('./src/state'),
      path.resolve('./node_modules')
    ]
  },
  externals: {
    'nano-sqlite': 'commonjs nano-sqlite',
    'sqlite3': 'commonjs sqlite3',
    'leveldown': 'commonjs leveldown'
  },
  plugins: [
    new DuplicatePackageCheckerPlugin({
      verbose: true,
      emitError: true
    })
  ]
}

const library = Object.assign({}, common, {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'build-module'),
    filename: 'index.js',
    libraryTarget: 'umd' // THIS IS THE MOST IMPORTANT LINE! :mindblow: I wasted more than 2 days until realize this was the line most important in all this guide.
  },
  plugins: [
    new DuplicatePackageCheckerPlugin({
      verbose: true,
      emitError: true
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
        DB_MODE: JSON.stringify(process.env.DB_MODE)
      }
    }),
    // new BundleAnalyzerPlugin()
  ],
  target: 'web',
  // devtool: 'cheap-module-eval-source-map',
  devtool: 'source-map',
  mode: process.env.NODE_ENV || 'production'
})
library.externals = Object.assign({}, library.externals, {
  'react': 'commonjs react',
  'React': 'commonjs react',
  'react-dom': 'commonjs react-dom',
  'react-bootstrap': 'commonjs react-bootstrap',
  'jquery': 'jquery'
  // 'nano-sql': 'commonjs nano-sql',
  // 'nano-sql-react': 'commonjs nano-sql-react',
  // 'react-animate-on-change': 'commonjs react-animate-on-change',
  // 'babel-polyfill': 'commonjs babel-polyfill'
})

const visualTests = Object.assign({}, common, {
  entry: ['babel-polyfill', './test/visual/visualTests.jsx'],
  output: {
    path: path.resolve(__dirname, 'build-tests'),
    filename: 'visualTests.js'
  },
  target: 'web',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        DB_MODE: JSON.stringify(process.env.DB_MODE || null)
      }
    })// ,
    // new CircularDependencyPlugin({
    //   // exclude detection of files based on a RegExp
    //   exclude: /node_modules|build-module|build-tests|server/,
    //   // add errors to webpack instead of warnings
    //   failOnError: false,
    //   // set the current working directory for displaying module paths
    //   cwd: process.cwd()
    // })
  ],
  // externals: [],
  mode: process.env.NODE_ENV || 'development',
  devtool: 'source-map'
})

const server = Object.assign({}, common, {
  entry: ['babel-polyfill', './src/sync/SyncServer.js'],
  output: {
    path: path.resolve(__dirname, 'server'),
    filename: 'server.js',
    libraryTarget: 'commonjs' // THIS IS THE MOST IMPORTANT LINE! :mindblow: I wasted more than 2 days until realize this was the line most important in all this guide.
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        DB_NAME: JSON.stringify('db-plenty-prod.sqlite3')
      }
    })
  ],
  target: 'node',
  mode: 'production'
})

const serverTest = Object.assign({}, server, {
  output: {
    path: path.resolve(__dirname, 'server'),
    filename: 'server-test.js',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('test'),
        DB_NAME: JSON.stringify('plenty-test-db.sqlite3')
      }
    })
  ],
  mode: 'development'
})

module.exports = webpackSelection(
  serverTest, server, library, visualTests
)
