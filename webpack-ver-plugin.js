
const fs = require('fs')
/**
new WebpackVerPlugin({
            ver: 'v8', //版本号
            filename: 'ver.json',
   }),
 **/
class WebpackVerPlugin {
    // 构造函数
    constructor(options) {
        console.log('WebpackVerPlugin ', options)
        this.options = options
    }
    // 应用函数
    apply(compiler) {
        // console.log(compiler)
        compiler.hooks.afterEmit.tapAsync('WebpackVerPlugin', async (compilation, callback) => {
            const outputPath = compilation.outputOptions.path
            const {ver, filename} = this.options
            fs.writeFile(path.join(outputPath, filename), JSON.stringify({ver}), err => {
                if (!err) console.log('write ver success !')
            })
            callback()
        })
    }
}
module.exports = WebpackVerPlugin
