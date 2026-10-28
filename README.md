# Brand Studio · DSH 侧边栏品牌

[![CI](https://github.com/elliotmasheal/dsh-brand-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/elliotmasheal/dsh-brand-studio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![DSH](https://img.shields.io/badge/DSH-0.2.1--rc.3-4D6BFE)](https://github.com/deepseek-ai/deepseek-harness)

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（下称 DSH）用的
**非官方社区插件**：把侧边栏左上角的品牌标志与名称换成你自己的，并把设置项直接混进
「设置 → 通用」页，**不新增左侧菜单**。

> English: [README.en.md](README.en.md)

## 功能

| 能力 | 选项 | 效果 |
| --- | --- | --- |
| Logo 来源 | 已登录账号头像 / 上传的图片 / 官方标志 | 决定左上角显示哪张图，展开态与收起后的图标条同时生效 |
| Logo 形状 | 纯圆 / 圆角矩形 | 纯圆会额外写 `corner-shape: round`，否则会被主题的超椭圆规则拉成圆角方 |
| 品牌名称 | 自由文本（≤ 24 字） | 留空即使用官方字标 DeepSeek Harness |
| Harness 徽标 | 开 / 关，仅自定义名称可用 | 在自定义名称后追加官方的 Harness 药丸徽标 |

几条行为规则：

- **官方名称时 Harness 固定显示**：官方字标是一整张图（DeepSeek + Harness），不拆开，
  所以名称留空时徽标开关被锁定，官方 logo 不会被改坏。
- **账号头像仅登录后可选**；未登录、账号无头像、未上传图片时都会回落到官方标志，
  而不是留一个空格子。
- **只有「上传的图片」来源才可更换/移除图片**，账号图片属于账号、官方标志属于构建，
  都不允许在本插件里改动。
- 选择「上传的图片」但还没存过图时，会自动弹出文件选择框。

## 截图

待补充：本地跑起来后截图放到 `docs/screenshot.png`，再在 README 顶部引用即可。

## 环境要求

- DSH **0.2.1-rc.3** 上下（开发与验证版本；槽位 API 若变更需同步调整）。
- Web 版与桌面版（Windows / macOS）均可；Windows 标题栏的 1px 布局偏移已适配。

## 安装

本插件是 DSH 的 bundle（`dsh.bundle.patch` + 客户端半），按下面任一路径装到某个 profile：

1. **让 DSH 内的 agent 安装**（推荐）：把仓库克隆到本机，然后在会话里让它对仓库目录执行
   bundle 安装（即插件管理器的 `install_bundle`，参数为仓库绝对路径）。
2. **命令行**：先用 `dsh plugin` 把依赖装进 profile，再启用对应的 bundle：

   ```sh
   dsh plugin --profile <profile> add /path/to/dshBrandStudio
   ```

装好后打开 设置 → 通用，向下滚动看到 5 行品牌设置即为成功。刷新页面生效。

卸载：移除该 bundle（插件管理器 `remove_bundle`），品牌槽位会自动交还给官方占位。

## 使用

设置 → 通用 页里新增的 5 行（顺序 40–44，位于「性能与用量」之后）：

| 行 | 说明 |
| --- | --- |
| Logo 来源 | 三选一；未登录时账号头像项置灰 |
| Logo 形状 | 纯圆 / 圆角矩形，作用于左上角标志与截图预览 |
| Logo 图片 | 32px 预览 + 选择 / 移除；非「上传」来源时禁用 |
| 品牌名称 | 输入即生效；「恢复官方」清空 |
| Harness 徽标 | 官方名称时锁定为开 |

配置保存在渲染进程的 `localStorage`（键 `dsh.custom-brand.v1`），上传图片会先居中裁成
192×192 的 WebP 再存，避免占满配额。**仅本机有效，不跨设备同步。**

## 实现说明

- 只占用官方槽位，不改其它插件的 DOM：
  - `sidebar.brand.mark` / `sidebar.brand.name`：有可显示的替换内容时才占位
    （优先级 `-1` 覆盖官方占位），否则自动让位给官方鱼形标志与字标。
  - `settings.general.item`：5 行设置，作为通用页的加法座位，不新增页面。
- 账号头像走官方 Remote 通道：`ctx.remote.account.watch()` 订阅登录状态，
  `getProfile({ version, locale, timezoneOffsetSeconds })` 读取 `avatarUrl`，
  图片在浏览器里解码成功后才上屏。
- Harness 徽标不是文字，而是按官方字标里的同一套几何（药丸底 + 反白字母）重绘的
  inline SVG，颜色取主题 token，深浅色都一致。
- 界面仅使用主题 token（`--dsw-alias-*`、`--dsw-radius-*`），不引入 Harness 客户端包。

## 目录结构

```
dshBrandStudio/
├─ client.js           浏览器半（品牌槽位 + 设置行），全部逻辑在这里
├─ index.js            宿主半（空实现，占位）
├─ cordis.patch.yml    bundle 补丁：插入 brand-studio 这一行
├─ package.json        包清单（dsh.bundle / dsh.client）
├─ locale/             插件卡片的中英文标题与描述
├─ icon.svg            插件图标
└─ .github/workflows/  CI：语法与 JSON 校验
```

## 开发

```sh
node --check client.js
node --check index.js
```

改完 `client.js` 保存即热重载，无需重启。更多约定见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 已知限制

- Harness 徽标的几何是从当前版本 DSH 的字标里取的；官方改版后需要同步更新
  `HARNESS_GLYPHS`。
- 设置存在本机 `localStorage`，清理站点数据会丢失（可用「恢复官方」重置）。
- 与其它同样占用 `sidebar.brand.*` 的插件互斥（都由优先级决定谁生效）。
- 不能把设置嵌进「账号与余额」页：设置框架没有页内插槽，同 id 会替换整页。

## 许可证

[MIT](LICENSE)。商标与第三方图形说明见 [NOTICE](NOTICE)：
DeepSeek / DeepSeek Harness 及相关标志归其所有者，本项目与 DeepSeek 无隶属关系；
官方 Harness 徽标的字形几何仅用于像素级对齐，不在 MIT 授权范围内。

## 更新记录

见 [CHANGELOG.md](CHANGELOG.md)。
