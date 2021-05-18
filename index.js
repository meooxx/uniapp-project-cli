#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const yargs = require('yargs/yargs')

const scripts = require('./template/package.json').scripts

const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv))
  .usage('Usage: unilaunch <path> --cmd <cmd>')
  .command('$0', 'the default command', (yargs) => {
    yargs.positional('path', {
      describe: '*inux 风格项目路径, 绝对路径或者相对运行时的路径',
      type: 'string'
    })
  })
  .demandOption(['cmd'])

  // .("unilaunch", "'*inux 风格项目路径, 绝对路径或者相对运行时的路径'")
  .example('unilaunch ./ --cmd dev:mp-weixin', '开发环境运行当前目录下项目')
  .alias('cmd', 'c')
  // .describe('path', '*inux 风格项目路径, 绝对路径或者相对运行时的路径')
  .describe('cmd', '启动script,同vue-cli建立的项目scripts字段')
  .epilogue(
    "cmd 可选项同vuecli项目下scripts中字段, 如 ['dev:mp-weixin', 'build:mp-weixin', 'dev:mp-alipay', 'build:mp-alipay']"
  ).argv

const cmdDir = argv._[0]
const parsedDir = path.posix.parse(cmdDir)
const cwd = process.cwd()
const projectDir = path.resolve(cwd, path.format(parsedDir))
const script = scripts[argv.cmd]
process.chdir(path.resolve(__dirname))

const { error } = require('@vue/cli-shared-utils')
if (!script) {
  error(`Command ${script} not found`)
  process.exit()
}

const runArgs = yargs(script).argv
const envs = runArgs._.slice(1, -2)
// const vueCMD = runArgs._.slice(-1)

const envObj = envs.reduce((o, key) => {
  const kv = key.split('=')
  o[kv[0]] = kv[1]
  return o
}, {})

process.env.UNI_INPUT_DIR = path.resolve(projectDir)

// platform , NODE_ENV
Object.assign(process.env, envObj)

const outPath = path.join(
  'unpackage',
  process.env.NODE_ENV === 'production' ? 'build' : 'dev',
  process.env.UNI_SUB_PLATFORM || process.env.UNI_PLATFORM
)
process.env.UNI_OUTPUT_DIR = path.join(projectDir, outPath)
process.env.UNI_CLI_CONTEXT = process.env.UNI_INPUT_DIR

if (process.env.UNI_SCRIPT) {
  const { initCustomScript } = require('@dcloudio/uni-cli-shared/lib/package')

  initCustomScript(
    process.env.UNI_SCRIPT,
    path.resolve(process.env.UNI_INPUT_DIR, 'package.json')
  )
}

const Service = require('@vue/cli-service')
const vueConfigJsPath = path.resolve(process.env.UNI_INPUT_DIR, 'vue.config.js')

if (fs.existsSync(vueConfigJsPath)) {
  process.env.VUE_CLI_SERVICE_CONFIG_PATH = vueConfigJsPath
}

// @vue/cli-service/lib/Service.js
const service = new Service(
  process.env.VUE_CLI_CONTEXT || path.resolve(__dirname, '.')
)
const platform = process.env.UNI_SUB_PLATFORM || process.env.UNI_PLATFORM
const args = {
  watch: process.env.NODE_ENV === 'development',
  minimize: process.env.UNI_MINIMIZE === 'true',
  clean: false
}

service
  .run(
    process.env.NODE_ENV === 'development' && platform === 'h5'
      ? 'uni-serve'
      : 'uni-build',
    args
  )
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
