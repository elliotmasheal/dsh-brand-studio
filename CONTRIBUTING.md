# 贡献指南

## 开发环境

- DeepSeek Harness（下称 DSH）0.2.1-rc.3 或相近版本。
- 把仓库克隆到任意目录，例如 `E:\dshBrandStudio`。

安装到本地 profile（二选一）：

1. 在 DSH 会话里让 agent 对该目录执行 bundle 安装（等价于插件管理器的
   `install_bundle`，参数为仓库绝对路径）。
2. 命令行安装依赖后启用 bundle：

   ```sh
   dsh plugin --profile <profile> add /path/to/dshBrandStudio
   ```

安装后打开 设置 → 通用，能看到 5 行品牌设置即成功。

## 改动与调试

- 入口是 `client.js`（浏览器半）与 `index.js`（宿主半，空实现）。
- 浏览器半是纯 ESM 脚本，包在 `window.__ModuleLoader__.load(...)` 里；**改完
  保存后插件会自动热重载**，无需重启 DSH。
- 语法自检（提 PR 前必须通过）：

  ```sh
  node --check client.js
  node --check index.js
  ```

- 调试槽位可用 agent 的 `cordis_inspect_query`（Provider `Slots`）查看
  `sidebar.brand.mark` / `sidebar.brand.name` / `settings.general.item`
  的占用情况。

## 约定

1. **不引入 Harness 客户端包**（如 `@deepseek-ai/dsh-client-ui-primitives`），
   只用 `require('react')` 与平台槽位 API。
2. **只用槽位，不碰 DOM**：不查询、不修改其它插件的 DOM 或样式表；能用槽位
   解决就不要用 `querySelector`。
3. **只用主题 token**（`--dsw-alias-*`、`--dsw-radius-*`、`--dsw-elevation-*`），
   保证深浅色都正常。
4. **中英词典同步**：`client.js` 里的 `EN` / `ZH` 键集合必须一致，
   `locale/en.json` 与 `locale/zh.json` 的 `meta` 也要同步。
5. 新增设置项优先复用现有的行渲染（`row()` / `radio()`），保持与通用页其它行的
   16px 行距和 0.5px 分隔线一致。

## 改包名时同步三处

包名被三处引用，改名必须一起改，否则插件会加载失败（`ERR_MODULE_NOT_FOUND`）：

1. `package.json` 的 `name`
2. `cordis.patch.yml` 里插入行的 `name`
3. `client.js` 里 `window.__ModuleLoader__.load({ id: ... })` 的模块 id，以及
   `tag.dataset.plugin` 的标记

## 提 PR 前检查

- [ ] `node --check client.js && node --check index.js` 通过
- [ ] `package.json`、`locale/*.json` 仍是合法 JSON
- [ ] 在 设置 → 通用 里实际点过一遍改动涉及的控件
- [ ] 官方标志、账号头像、上传图片三条回退路径都仍然正常
- [ ] 词典中英同步，CHANGELOG 的 `Unreleased` 段落有记录
