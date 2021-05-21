const path = require('path');
const nodeExternals = require('webpack-node-externals');

const Paths = {
    deploy: path.resolve(__dirname, './deploy'),
    main: path.resolve(__dirname, './src/main.ts'),
    server: path.resolve(__dirname, './src/server'),
    client: path.resolve(__dirname, './src/client'),
};

const typescriptRule = {
    test: /\.tsx?$/,
    exclude: /(node_modules)/,
    use: [
        {
            loader: 'babel-loader',
            options: {
                presets: [
                    '@babel/preset-env',
                    '@babel/preset-typescript'
                ],
                plugins: [
                    ['@babel/transform-runtime']
                ]
            }
        }, {
            loader: 'ts-loader'
        }
    ]
};

const resolve = {
    extensions: ['.ts', '.js'],
    alias: {
        vue$: 'vue/dist/vue.esm.js',
        src: path.resolve(__dirname, 'src'),
        main: Paths.main,
        server: Paths.server,
        client: Paths.client,
    }
}

function inDev() {
    return process.env.NODE_ENV === 'development'
}

const Server = {
    mode: process.env.NODE_ENV,
    context: Paths.server,
    entry: {
		main: Paths.main,
	},
    target: 'node',
    externals: [nodeExternals()],
    output: {
        path: path.join(Paths.deploy),
        filename: '[name].js'
    },
    resolve: resolve,
    module: {
        rules: [
            typescriptRule
        ]
    },
	devtool: 'inline-source-map',
    // devServer: {
    //     open: true,
    //     port: 3069,
    //     proxy: {
    //         '/': `http://localhost:8080`
    //     }
	// },
    // cache: !inDev()
};

module.exports = [Server];