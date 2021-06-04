#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const yargs = require('yargs/yargs')
const cp = require('child_process')
const scripts = require('./template/package.json').scripts
const { hideBin } = require('yargs/helpers')

const platform = process.env.__TESTING_FAKE_PLATFORM__ || process.platform
const isWindows = platform === 'win32'
const argv = yargs(hideBin(process.argv))
  .usage('Usage: unilaunch <path> --cmd <cmd>')
  .command('$0', 'which project dir to run in', (yargs) => {
    yargs
      .positional('path', {
        describe: '*inux 风格项目路径, 绝对路径或者相对运行时的路径, 默认 `.`',
        defaultDescription:
          '*inux 风格项目路径, 绝对路径或者相对运行时的路径, 默认`.`',
        type: 'string',
        default: '.'
      })
      .option('cmd', {
        alias: 'c',
        defaultDescription: '启动script,同由vue-cli建立的项目中scripts字段',
        describe: '启动script,同vue-cli建立的项目scripts字段',
        type: 'string',
        demandOption: true
      })
  })
  .command('ls', 'list all avalible scripts')
  .demandCommand(1)
  .example('unilaunch ./ --cmd dev:mp-weixin', '开发环境运行当前目录下项目')

  // 最后补充说明部分
  .epilogue(
    "cmd 可选项同vuecli项目下scripts中字段, 如 ['dev:mp-weixin', 'build:mp-weixin', 'dev:mp-alipay', 'build:mp-alipay']\n" +
      'path 不区分windows使用, 统一为/root/path/to/project, or ./project'
  ).argv

// project 目录参数
const cmdDir = argv._[0]
if (cmdDir === 'ls') {
  console.log('All avalible scripts:')
  console.log(Object.keys(scripts).join(', '))
  return
}
const { error } = require('@vue/cli-shared-utils')
const script = scripts[argv.cmd]
const parsedDir = path.posix.parse(cmdDir)
// 目标 wd
const cwd = process.cwd()
const projectDir = path.resolve(cwd, path.format(parsedDir))
// 切换上下文到本包 wd
process.chdir(path.resolve(__dirname))
if (!script) {
  error(`--cmd ${argv.cmd} not found`)
  process.exit()
}
// serve: npm run dev:h5
// dev:h5: cross-env NODE_ENV=production vue-cli-serve uniapp-serve
// npm run serve => npm run dev:h5 => cross-env NODE_ENV=production vue-cli-server
const parseScript = function(script) {
  switch (true) {
    case script.startsWith('npm'): {
      script = script.split(' ').pop()
      if (scripts[script]) {
        return parseScript(scripts[script])
      }
    }
    case script.startsWith('node'):
    case script.startsWith('cross-env'): {
      // 程序在 uni-project-cli 目录运行
      // 指定 jest 目录
      if (script.indexOf('jest') !== -1) {
        script += ` --projects ${projectDir}`
      }
      return script
    }
  }
}

const finalScript = parseScript(script)

const scriptsArgs = yargs(finalScript).argv._
let nodeEnv = 'production'
let buildPlatform = 'h5'
scriptsArgs.forEach((env) => {
  if (env.indexOf('NODE_ENV') !== -1) {
    nodeEnv = env.split('=')[1]
  }
  if (env.indexOf('UNI_PLATFORM') !== -1) {
    buildPlatform = env.split('=')[1]
  }
})
const outPath = path.join(
  'unpackage',
  nodeEnv === 'production' ? 'build' : 'dev',
  buildPlatform
)
process.env.UNI_OUTPUT_DIR = path.join(projectDir, outPath)
process.env.UNI_INPUT_DIR = path.resolve(projectDir)
process.env.UNI_CLI_CONTEXT = process.env.UNI_INPUT_DIR

if (process.env.UNI_SCRIPT) {
  const { initCustomScript } = require('@dcloudio/uni-cli-shared/lib/package')

  initCustomScript(
    process.env.UNI_SCRIPT,
    path.resolve(process.env.UNI_INPUT_DIR, 'package.json')
  )
}

const vueConfigJsPath = path.resolve(process.env.UNI_INPUT_DIR, 'vue.config.js')

if (fs.existsSync(vueConfigJsPath)) {
  process.env.VUE_CLI_SERVICE_CONFIG_PATH = vueConfigJsPath
}

// spawn 参数
const getSpawnArgs = (cmd) => {
  let sh = 'sh'
  let shFlag = '-c'
  const binPath = [
    path.join(__dirname, 'node_modules', '.bin'),
    path.join(projectDir, 'node_modules', '.bin'),
    process.env.PATH
  ].join(isWindows ? ';' : ':')

  const conf = {
    env: {
      ...process.env,
      PATH: binPath
    },
    cwd: process.cwd(),
    stdio: [0, 1, 2]
  }
  if (isWindows || process.env.__TESTING_FAKE_PLATFORM__) {
    sh = process.env.comspec || 'cmd'
    // '/d /s /c' is used only for cmd.exe.
    if (/^(?:.*\\)?cmd(?:\.exe)?$/i.test(sh)) {
      shFlag = '/d /s /c'
      conf.windowsVerbatimArguments = true
    }
  }
  return [sh, [shFlag, cmd], conf]
}
// 执行到 cmd
console.log(finalScript)
const [sh, env, conf] = getSpawnArgs(finalScript)
// do it
// 模仿 `npm run`
const proc = cp.spawn(sh, env, conf)

process.once('SIGTERM', () => {
  proc.kill()
})
process.once('SIGINT', () => {
  proc.kill('SIGINT')
  proc.on('exit', function() {
    process.exit()
  })
})
