const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin'); // 추가

// HTML 파일 스캔
const htmlFiles = glob.sync('./src/templates/**/*.html');

// 엔트리 생성
const entries = htmlFiles.reduce((entryObj, templatePath) => {
    const entryName = path.relative('./src/templates', templatePath).replace('.html', '');
    const jsFilePath = path.resolve(__dirname, `./src/static/js/${entryName}.jsx`);

    if (glob.sync(jsFilePath).length > 0) {
        entryObj[entryName] = jsFilePath;
    } else {
        console.warn(`JS 파일을 찾을 수 없습니다: ${jsFilePath}`);
    }

    return entryObj;
}, {});

// HTMLWebpackPlugin 인스턴스 생성
const htmlPlugins = htmlFiles.map(templatePath => {
    const relativePath = path.relative('./src/templates', templatePath);
    const entryName = relativePath.replace('.html', '');
    return new HtmlWebpackPlugin({
        template: templatePath,
        filename: `templates/${relativePath}`, // HTML 파일이 dist/templates 경로로 출력
        chunks: entries.hasOwnProperty(entryName) ? [entryName] : [], // 해당 엔트리와 매칭되는 JS 포함
    });
});

module.exports = (env, argv) => {
    const isProd = argv.mode === 'production';

    return {
        entry: entries,
        output: {
            filename: (pathData) => {
                const relativePath = pathData.chunk.name;
                return `static/js/${relativePath}.js`;
            },
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/', // 브라우저가 파일을 참조할 기본 경로
        },
        resolve: {
            extensions: ['.js', '.jsx'],
            fallback: {
                'path': false,
                'fs': false
            },
            modules: [
                path.resolve(path.resolve(__dirname, 'src/static').replace(/\\/g, '/'), 'modules'),
                'node_modules',
            ],
            alias: {
                '@modules': path.resolve(__dirname, 'src/static/modules'),
                '@js': path.resolve(__dirname, 'src/static/js'),
                '@images': path.resolve(__dirname, 'src/static/images'),
                '@scss': path.resolve(__dirname, 'src/static/scss'),
            },
        },
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                                implementation: require('sass'),
                            },
                        },
                    ],
                },
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        'css-loader',
                    ],
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: 'asset/resource',
                },
            ],
        },
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist'),
                watch: true,
            },
            hot: true,
            port: 3000,
            open: true,
            watchFiles: ['./src/templates/**/*.html', './src/static/js/**/*.js', './src/static/scss/**/*.scss'],

            proxy: [
                {
                    context: ['/'],
                    target: 'http://localhost:8080',
                    changeOrigin: true
                }
            ]
        },
        plugins: [
            ...(isProd ? [new CleanWebpackPlugin()] : []),
            ...htmlPlugins,
            new CopyWebpackPlugin({
                patterns: [
                    { from: 'src/static/fonts', to: 'static/fonts', noErrorOnMissing: true  }, // fonts 복사
                    { from: 'src/static/images', to: 'static/images', noErrorOnMissing: true  }, // images 복사
                ],
            }),
        ],
        devtool: isProd ? 'hidden-source-map' : 'source-map',
        mode: isProd ? 'production' : 'development',
    };
};
