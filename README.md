# uniapp-project-cli

`0` 侵入, 不需要使用 `hbuildx` 来启动由 `hbuildx` 创建的 `uniapp` 项目

## Quick start
1 全局安装

```bash
npm install -g github:meooxx/uniapp-project-cli

```

2 启动项目

```bash

unilaunch . -c dev:mp-weixin

```

## CLI 
```shell
Usage: unilaunch <path> --cmd <cmd>

Commands:
  unilaunch     which project dir to run in                                [default]
  unilaunch ls  list all avalible scripts

Positionals:
  path
   [string] [default: *inux 风格项目路径, 绝对路径或者相对运行时的路径, 默认`.`]

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -c, --cmd
    [string] [required] [default: 启动script,同由vue-cli建立的项目中scripts字段]

Examples:
  unilaunch ./ --cmd dev:mp-weixin  开发环境运行当前目录下项目

cmd 可选项同vuecli项目下scripts中字段, 如 ['dev:mp-weixin', 'build:mp-weixin',
'dev:mp-alipay', 'build:mp-alipay']
path 不区分windows使用, 统一为/root/path/to/project, or ./project
```

## Pros

对于已经使用 `hbuildx` 创建的小程序项目, 想使用 `vue-cli`, 以及 `vue-cli` 支持的特性。
按照 `uniapp` 官方说法需要将项目做转换 [官方回答](https://ask.dcloud.net.cn/question/73762).即, 将 hbuildx 创建的 project 放到 `vue-cli` 创建的项目中`src`目录下。但是这样有个问题, 如果项目已经维护很久还正在迭代开发的话, 这样的迁移成本是巨大的(经历过). 所以有了这个项目,   
`可直接使用命令行启动项目, 无限接近于vue-cli 的体验`。  
`且将提供接近与 0 的转换成vue-cli的方法`

## Cons  

1. 没有`window`设备, 待验证
2. `sass`, `sass-loader`: `sass`使用 `Dart Sass`, `sass-loader`, 可能会因为国内网络原因挂壁, 请自行解决

## Cli 详细说明
`unilaunch:` 声明在 `bin` 字段中.`-g`安装则全局使用  
`path:` 需要编译的 `project` 目录, 支持绝对路径和相对路径. `windows` 和 `macos` 使用相同路径格式. 即在`windows`中`macos`都要指定 `/User/xxx/project`这种类型路径.`相对路径` 基于当前路径解析. 比如在`project` 下执行 `./b` , 解析为 `project/b`  
`-c, --cmd:` 一一对应`vue-cli`创建的`uniapp`项目下`package.json`中`scripts`里的字段. 如 `dev:h5`, `dev:mp-weixin` 等等  
实际场景 如由项目 `/User/xxx/project/b`, 想要启动项目 `b`, 可以进入到 `b` 目录中执行 `unilaunch . -c dev:h5`, 或者 `unilaunch /User/xxxproject/b -c dev:h5`

## 进度
- [ ] 可以迁移指定项目的时候发布正式版和npm版本 
- [ ] 基本无痛迁移到 `vue-cli`  
- [x] 100% 支持vue-cli项目中scripts字段
- [x] 启动项目


