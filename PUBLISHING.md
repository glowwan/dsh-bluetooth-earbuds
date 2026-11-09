# 发布到 DSH 插件市场

本目录已经是公开插件仓库 `glowwan/dsh-bluetooth-earbuds` 的发布内容。市场数据源：

- 精选列表：<https://github.com/awesome-dsh-plugin/awesome-dsh-plugin>
- 一个插件一个 YAML：`data/plugins/glowwan__dsh-bluetooth-earbuds.yml`
- 站点：<https://awesome-dsh-plugin.com>

npm 发布可选；市场可以直接从 GitHub 安装。

## 已准备好的内容

- 公开包名：`dsh-bluetooth-earbuds`
- `package.json` 同时声明 `dsh.bundle.patch` 和 `dsh.client`
- 根目录 `cordis.patch.yml`
- 中英文 README、MIT LICENSE
- 市场条目：[market/glowwan__dsh-bluetooth-earbuds.yml](market/glowwan__dsh-bluetooth-earbuds.yml)
- PR 正文：[market/PR-body.md](market/PR-body.md)
- 没有提交 `.exe`；首次启动用系统 `csc.exe` 从 `helper/EarbudHelper.cs` 编译

## 发布步骤

### 1. 建公开仓库

```powershell
git init -b main
git add -A
git commit -m "dsh-bluetooth-earbuds 1.0.3"
gh repo create glowwan/dsh-bluetooth-earbuds --public --source . --remote origin --push
gh repo edit glowwan/dsh-bluetooth-earbuds --add-topic dsh-plugin
```

仓库要求：

- public
- topic `dsh-plugin`
- 创建满 1 天后才能提收录 PR（市场 CI 检查）
- 不要提交 `*.exe`

### 2. 可选：发 npm

```powershell
npm publish --access public
```

包名 `dsh-bluetooth-earbuds` 已核实未被占用。发 npm 不是收录的前提；条目 YAML 不要手写 `npm:` 字段，市场会从 registry 自动关联。

### 3. 等仓库满 1 天，提收录 PR

1. Fork <https://github.com/awesome-dsh-plugin/awesome-dsh-plugin>
2. 从 `main` 新建分支，例如 `add-dsh-bluetooth-earbuds`
3. 新增 `data/plugins/glowwan__dsh-bluetooth-earbuds.yml`，内容用 `market/glowwan__dsh-bluetooth-earbuds.yml`
4. 不要改生成的 README；只加这一个 YAML
5. 提 PR，正文用 `market/PR-body.md`

分类为 `voice`。

### 4. 市场 CI 会检查

- 一个 PR 最多 3 条
- 仓库存在、公开、未归档
- `package.json` 声明 `dsh.bundle`
- 仓库创建满 1 天
- `dsh-plugin` topic
- YAML 字段/文件名/slug/分类合法
- 描述与代码一致，不夸大

合并后站点重建，`plugins.json` 每日刷新，市场重新打开即可看到。

## 为什么仓库里没有预编译 EXE

- 市场/安全审查更愿意看源码。
- Host 在首次启动时用 `C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe` 编译 `helper/EarbudHelper.cs`。
- 如果目标机器缺少该编译器，设置页会显示编译错误。

## 凭据

不要把 GitHub PAT、npm token 或任何密钥提交进仓库。`gh auth login` 的凭据保存在系统凭据管理器，命令行只使用登录态。
