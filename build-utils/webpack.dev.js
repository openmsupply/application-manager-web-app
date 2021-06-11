const webpack = require('webpack')
const port = process.env.PORT || 3000

const config = {
  mode: 'development',
  output: {
    filename: '[name].[hash].js',
  },
  devtool: 'inline-source-map',
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    host: 'localhost',
    port: port,
    historyApiFallback: true,
    hot: true,
    open: true,
  },
}
module.exports = config
