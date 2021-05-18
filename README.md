# uniapp-project-cli

`0` 侵入, 不需要使用 `huildx` 来启动由 `hbuildx` 创建的 `uniapp` 项目

## Quick start
1 全局安装

```bash
npm install -g npm install -g github:meooxx/uniapp-project-cli

```

2 启动项目

```bash

unilaunch . -c dev:mp-weixin

```

## Pros

对于已经使用 `hbuildx` 创建的小程序项目, 想使用 `vue-cli`, 以及 `vue-cli` 支持的特性。
按照 `uniapp` 官方说法需要将项目做转换 [官方回答](https://ask.dcloud.net.cn/question/73762).即, 将 hbuildx 创建的 project 放到 `vue-cli` 创建的项目中`src`目录下。但是这样有个问题, 如果项目已经维护很久还正在迭代开发的话, 这样的迁移成本是巨大的(经历过). 所以有了这个项目,   
`可直接使用命令行启动项目, 无限接近于vue-cli 的体验`。  
`且将提供接近与0的转换成vue-cli的方法`

## Cons
1 `scripts`中尚未100%支持, 如 `npm run jest` 等, 目前支持`dev:xxx`, `build:xxx`, 完善中

## 进度

- [ ] 基本无痛迁移到 `vue-cli`  
- [x] 启动项目


