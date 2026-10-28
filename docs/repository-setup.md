# 仓库设置速查

代码本身不需要这些配置，但开源仓库的「门面」由平台设置决定，命令行 `/ gh` 或网页都能改。
以下命令假设仓库已经存在：`elliotmasheal/dsh-brand-studio`。

## 仓库简介（Description）

GitHub 上限 350 字符，建议：

```
DSH 侧边栏品牌插件：账号头像或上传图片作 Logo，纯圆/圆角矩形，自定义名称与官方 Harness 徽标。非官方社区插件。
```

站点（Homepage）留空即可，README 已经是首页；若要填，用
`https://github.com/elliotmasheal/dsh-brand-studio#readme`。

## Topics（GitHub）

推荐 10 个（小写、连字符）：

```
deepseek-harness, dsh, dsh-plugin, branding, sidebar, avatar, customization, plugin, ui, mit-license
```

一条命令写入（`gh` 已登录且有 `repo` 权限）：

```sh
gh repo edit elliotmasheal/dsh-brand-studio \
  --description "DSH 侧边栏品牌插件：账号头像或上传图片作 Logo，纯圆/圆角矩形，自定义名称与官方 Harness 徽标。非官方社区插件。" \
  --homepage "https://github.com/elliotmasheal/dsh-brand-studio#readme" \
  --add-topic deepseek-harness,dsh,dsh-plugin,branding,sidebar,avatar,customization,plugin,ui,mit-license
```

也可以网页操作：仓库页右上 ⚙️ → **Topics** → 粘贴上面逗号分隔的列表。

## Gitee 侧

Gitee 用「标签」承担同样作用，没有 CLI 等价命令（`gh` 不适用）：

1. 打开 `https://gitee.com/<你的用户名>/dsh-brand-studio`
2. 管理 → 基本信息 → 标签，填入与 GitHub 相同的一组（Gitee 标签数量上限更小，取前 6 个即可）
3. 简介直接粘贴上面同一段描述

建议用 Gitee 的「从 GitHub 导入仓库」做镜像，之后只需要推 GitHub，Gitee 手动同步；
或本地加第二个 remote：

```sh
git remote add gitee git@gitee.com:<你的用户名>/dsh-brand-studio.git
git push gitee main --tags
```

## 其它建议

- **About 的 Releases / Packages** 不用额外配置，打 tag 后自动出现。
- **Social preview**（分享卡片）：仓库 Settings → Social preview，上传 1280×640 的图，
  可用侧边栏截图 + 标题文字拼一张。
- **分支保护**：单人项目可跳过；若开放 PR，建议要求 CI 通过再合并。
- **Discussions**：Issue 模板里没有引用它，暂不开启也不影响。
