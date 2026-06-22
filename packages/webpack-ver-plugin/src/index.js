/** @format */
/**
 * new WebpackVerPlugin({
 *            ver: 'v8',          // 版本号
 *            filename: 'ver.json',
 * })
 */
const fs = require('fs')
const path = require('path')

class WebpackVerPlugin {
    // 构造函数
    constructor(options) {
        this.options = options
    }
    // 应用函数
    apply(compiler) {
        compiler.hooks.afterEmit.tapAsync('WebpackVerPlugin', async (compilation, callback) => {
            const outputPath = compilation.outputOptions.path
            const {ver, filename} = this.options
            fs.writeFile(path.join(outputPath, filename), JSON.stringify({ver}), err => {
                if (!err) {
                    console.log('write ver success !')
                }
                // 等文件写完（无论成功/失败）再放行，避免 callback 早于 IO 完成
                callback()
            })
        })
    }
}
module.exports = WebpackVerPlugin
