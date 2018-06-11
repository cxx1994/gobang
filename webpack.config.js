module.exports = {
    entry: './src/index.js',
    output: {
        path: './dist',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                //处理ES6语法
                test: /\.js$/,
                //loader babel
                loader: 'babel',
                exclude: /node_modules/
            }
        ]
    }
}