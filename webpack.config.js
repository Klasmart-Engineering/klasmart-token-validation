const path = require('path')

module.exports = {
  mode: 'production',
  target: 'node',
  entry: ['regenerator-runtime/runtime','./src/main.ts'],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    library: 'kidsloop-token-validation'
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  resolve: {
    extensions: [
      '.js',
      '.ts',
      '.jsx',
      '.tsx'
    ]
  },
  optimization: {
    nodeEnv: false
  },
  plugins: []
}
