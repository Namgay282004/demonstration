const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { TsconfigPathsPlugin } = require("tsconfig-paths-webpack-plugin");
const webpack = require("webpack");
const packageJson = require("./package.json");

const mapObject = (object, fn) => {
  const objectified = Object.entries(object).map(fn);
  return Object.assign({}, ...objectified);
};

module.exports = (env) => ({
  entry: "./src/index.tsx",
  ...(env.production || !env.development ? {} : { devtool: "eval-source-map" }),
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    plugins: [new TsconfigPathsPlugin()],
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "build.js",
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        loader: "ts-loader",
        options: {
          transpileOnly: true,
        },
        exclude: /node_modules/,
      },
      {
        test: /\.m?jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
  devServer: {
    host: "0.0.0.0",
    port: 3010,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    hot: true,
    open: true,
    historyApiFallback: true,
    proxy: {
      "/api": {
        target: {
          host: "localhost",
          protocol: "http:",
          port: 3000,
        },
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      favicon: "./public/favicon.ico",
      publicPath: "/",
    }),
    new webpack.DefinePlugin({
      ...mapObject(env, ([key, value]) => ({
        [`process.env.${key}`]: JSON.stringify(value),
      })),
      "process.env.PRODUCTION": JSON.stringify(env.production || false),
      "process.env.API_HOST": JSON.stringify(env.API_HOST || "/api"),
      "process.env.NAME": JSON.stringify(packageJson.name),
      "process.env.VERSION": JSON.stringify(packageJson.version),
    }),
  ],
});