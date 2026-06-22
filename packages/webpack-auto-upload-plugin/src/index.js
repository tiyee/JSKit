/** @format */
/**
 *
 *       new AutoUploadPlugin({
            host: '127.0.0.0',
            username: 'root',
            password: 'root123456',
            remotePath: '/www/wwwroot/test'
            useSSH:true
            privateKey:''

        })
 *
 */
const {NodeSSH} = require('node-ssh')
const path = require('path')

class AutoUploadPlugin {
    // 通过构造函数来接收插件参数，并实例化ssh
    constructor(options) {
        this.ssh = new NodeSSH()
        this.options = options
    }

    // 实现apply
    apply(compiler) {
        // 监听钩子，afterEmit 为打包资源被输出到打包目录后的 hook
        compiler.hooks.afterEmit.tapAsync('AutoUploadPlugin', async (compilation, callback) => {
            // 校验 remotePath，避免误删服务器根目录或关键路径
            const serverDir = this.options.remotePath
            if (!serverDir || typeof serverDir !== 'string') {
                callback(new Error('[AutoUploadPlugin] remotePath 未配置，已跳过上传'))
                return
            }
            // 解析为绝对路径后再判断，拒绝根目录、家目录、纯盘符等危险路径
            const resolved = path.resolve(serverDir)
            const dangerous = ['/', path.parse(resolved).root, '/root', '/home', '/usr', '/var', '/etc', '/bin', '/boot', '/lib', '/opt', '/sbin', '/sys', '/dev']
            if (dangerous.indexOf(resolved) !== -1) {
                callback(new Error(`[AutoUploadPlugin] remotePath "${resolved}" 是危险路径，已拒绝执行`))
                return
            }

            // 上传文件到服务器操作步骤
            // 1.获取输出文件夹
            const outputPath = compilation.outputOptions.path
            // 2.用 node-ssh 库来连接服务器(ssh连接)
            await this.connectServer()
            // 3.删除服务器上文件夹内的内容
            await this.ssh.execCommand(`rm -rf ${resolved}/*`)
            // 4.上传文件到服务器(ssh连接)
            await this.uploadFiles(outputPath, resolved)
            // 5.关闭SSH
            this.ssh.dispose()

            callback()
        })
    }

    // 封装连接
    async connectServer() {
        const {useSSH, host, username, privateKey, password} = this.options
        let cfg = {
            host: host,
        }
        if (useSSH) {
            cfg = {
                ...cfg,
                username: username ?? process.env.USER,
                privateKey: privateKey ?? `${process.env.HOME}/.ssh/id_rsa`,
            }
        } else {
            cfg = {
                ...cfg,
                username,
                password,
            }
        }
        await this.ssh.connect(cfg)
        console.log('服务器连接成功！')
    }

    // 封装上传文件
    async uploadFiles(localPath, remotePath) {
        const status = await this.ssh.putDirectory(localPath, remotePath, {
            recursive: true, // 递归上传
            concurrency: 10, // 并发数
        })
        console.log('上传', status ? '成功！' : '失败！')
    }
}

module.exports = AutoUploadPlugin
