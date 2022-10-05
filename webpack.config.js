const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require("path")

module.exports = {
    entry: './src/main.js',
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.css/i,
                use: ['style-loader','css-loader']
            }  
       ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Popculture Library",
            filename: "index.html",
            template: "./src/index.html",
        })
    ],
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname,'dist'),
        clean: true,
    }
}