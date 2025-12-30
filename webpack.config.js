const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (env) => {

  const buildPath = env.development
    ? "C:/Users/aioverg/AppData/Roaming/Adobe/CEP/extensions/dist"
    : "dist";

  const mode = env.development ? "development" : "production"
  return {
    mode: mode,
    entry: {
      //入口文件依赖
      main: "./src/main.js",
    },
    plugins: [
      new CleanWebpackPlugin(), //默认清除输出文件目录
      new HtmlWebpackPlugin({
        //管理输出
        template: path.resolve(__dirname, "./src/index.html"), //入口文件
        chunks: ["main"], //入口文件依赖
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(path.resolve(__dirname, "adobe")),
            to: path.resolve(`${buildPath}/[path][name][ext]`),
            noErrorOnMissing: true,
          },
        ],
      }),
    ],
    output: {
      filename: "[name].bundle.js",
      path: path.resolve(`${buildPath}`),
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
              plugins: [
                [
                  "react-css-modules",
                  {
                    generateScopedName: "[name]__[local]___[hash:base64:5]",
                    filetypes: { ".css": { syntax: "postcss" } },
                    handleMissingStyleName: "warn",
                  },
                ],
              ],
            },
          },
        },
        {
          test: /\.module\.css$/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                esModule: false,
                modules: {
                  localIdentName: "[name]__[local]___[hash:base64:5]",
                },
                importLoaders: 1,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    resolve: {
      // 配置能够被解析的文件扩展名
      extensions: [".mjs", ".js", ".ts", ".tsx", ".json", ".jsx"],
    },
  };
};
