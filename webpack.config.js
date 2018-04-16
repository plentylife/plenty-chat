const webpack = require('webpack') // to access built-in plugins
var path = require('path')

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
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test')
        ],
        exclude: /(node_modules|bower_components|build)/,
        loader: 'babel-loader'
      },
      {
        test: /\.node$/,
        use: 'node-loader'
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
      path.resolve('./src/db'),
      path.resolve('./src/state'),
      path.resolve('./node_modules')
    ]
  },
  externals: {
    'nano-sqlite': 'commonjs nano-sqlite',
    'sqlite3': 'commonjs sqlite3',
    'leveldown': 'commonjs leveldown'
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
    'react': 'commonjs react', // this line is just to use the React dependency of our parent-testing-project instead of using our own React.
    'react-bootstrap': 'commonjs react-bootstrap'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production')
      }
    })
  ],
  target: 'web',
  devtool: 'source-map',
  mode: process.env.NODE_ENV || 'production'
})

const visualTests = Object.assign({}, common, {
  entry: './test/visual/visualTests.jsx',
  output: {
    path: path.resolve(__dirname, 'build-tests'),
    filename: 'visualTests.js'
  },
  target: 'web',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    })
  ],
  mode: 'development',
  devtool: 'cheap-module-eval-source-map'
})

const dbTests = Object.assign({}, common, {
  entry: './test/db/dbDumpsNode.js',
  output: {
    path: path.resolve(__dirname, 'build-tests'),
    filename: 'dbDumpsModule.js',
    libraryTarget: 'umd' // THIS IS THE MOST IMPORTANT LINE! :mindblow: I wasted more than 2 days until realize this was the line most important in all this guide.
  },
  target: 'node',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('testperm')
      }
    })
  ],
  mode: 'development'
  // devtool: 'source-map'
})

const server = Object.assign({}, common, {
  entry: './src/sync/SyncServer.js',
  output: {
    path: path.resolve(__dirname, 'server'),
    filename: 'server-lib.js',
    libraryTarget: 'umd' // THIS IS THE MOST IMPORTANT LINE! :mindblow: I wasted more than 2 days until realize this was the line most important in all this guide.
  },
  target: 'node',
  // mode: process.env.NODE_ENV || 'development',
  devtool: 'source-map'
})

const serverTest = Object.assign({}, server, {
  output: {
    path: path.resolve(__dirname, 'server'),
    filename: 'server-test-lib.js',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        // NODE_ENV: JSON.stringify('testperm'),
        NODE_ENV: JSON.stringify('test'),
        DB_NAME: JSON.stringify('plenty-test-db.sqlite3')
        // DEBUG: JSON.stringify('*')
      }
    })
  ],
  mode: 'development',
  devtool: 'source-map'
})

module.exports = [
  serverTest
  // server
  // library,
  // visualTests, dbTests
]
