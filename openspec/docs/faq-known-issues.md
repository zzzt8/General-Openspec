# OpenSpec 已知问题与 FAQ

> **v5.3** | OpenSpec Skill System

> 本文档记录 OpenSpec Skill 系统使用过程中的已知问题、解决方案和限制说明。

---

## FAQ

### Q1: PowerShell 执行 .ps1 脚本报错（编码问题）

**问题**：执行 `_xplat.ps1` 或 `health-check.ps1` 时报错，类似：

```
无法识别"xxx"，是因为此命令不存在...
```

**原因**：Cursor 的 Write tool 输出 UTF-8 BOM（Byte Order Mark），而 PowerShell 5.x 的 `-File` 参数不支持 BOM，导致文件头被当作命令解析。

**解决**：使用 `-Command` 参数而非 `-File`：

```powershell
# 错误
powershell -File .cursor/skills/_shared/_xplat.ps1

# 正确
powershell -Command ". '.cursor/skills/_shared/_xplat.ps1'; Get-Config openspec/config.yaml"
```

**预防**：在 Cursor IDE 中创建/编辑 .ps1 文件时，避免使用 Write tool 的自动编码，选择"无 BOM"的 UTF-8。

---

### Q2: 项目不在 Git 仓库中（增量验证降级）

**问题**：Health check 输出 `WARNING: .git/ not found` 或 `WARNING: git not available`。

**影响**：
- 增量验证（基于 `git diff`）不可用，所有验证降级为全量
- 无法自动获取实际改动的文件列表
- `openspec-apply` 中的 TFA（Test Failure Attribution）无法使用 git diff 证据

**解决**：将项目纳入 Git 版本控制：

```bash
cd "your-project"
git init
git add .
git commit -m "Initial commit"
```

**说明**：这是当前项目的已知限制。项目位于 `d:\Desktop\Product\General Openspec\`，不在 git 仓库内。OpenSpec CLI 和 Skill 系统的核心功能仍正常运行，仅增量特性降级。

**状态**：v5.0 引入，v5.1 待修复。

---

### Q3: `openspec new change` 不生成完整 artifacts

**问题**：运行 `openspec new change <name>` 后，只生成了 `.openspec.yaml` 骨架文件，没有自动生成 `proposal.md`、`design.md` 等。

**说明**：这是 CLI 的设计行为，不是 bug。CLI 只负责创建 change 目录结构，artifacts 由 AI Agent 根据 `openspec-propose` skill 流程生成。

**解决**：CLI 创建骨架后，调用 `/opsx-propose` 让 AI Agent 填充完整 artifacts。

---

### Q4: `openspec show <archived-change>` 报错

**问题**：归档后的 change 无法通过 CLI `show` 命令查看。

**原因**：CLI 的 `show` 命令只查询 `openspec/changes/` 目录，不搜索 `openspec/changes/archive/`。

**状态**：**已有 workaround**。详见 [archive-guide.md](./archive-guide.md) 提供的 PowerShell/Bash 命令，可直接读取文件系统查看归档内容。

**workaround**：直接读取文件系统：

```bash
# 列出归档目录
ls openspec/changes/archive/

# 查看归档的 proposal
cat openspec/changes/archive/<date>-<name>/proposal.md

# 查看归档的所有 artifacts
ls openspec/changes/archive/<date>-<name>/
```

---

### Q5: `pnpm typecheck` / `pnpm test` 报错（config.yaml 中的桩命令）

**问题**：运行 `config.yaml` 中定义的 verify 命令（如 `pnpm typecheck --filter=@myproject/engine`）报错。

**原因**：`config.yaml` 中的 verify 命令指向不存在的包。本项目是 OpenSpec Skill 系统的元项目，没有实际业务代码包。

**解决**：verify 命令已替换为桩命令（echo 输出），不影响 Skill 系统正常运行。实际项目中请将 `config.yaml` 的 verify 命令替换为真实路径：

```yaml
verify:
  engine:
    typecheck: pnpm typecheck --filter=@yourproject/engine
    test: pnpm test --filter=@yourproject/engine
```

---

### Q6: `openspec instructions specs` 模板路径错误（v5.0 缺陷，已修复）

**问题**：`openspec instructions specs --change "<name>"` 无法正确加载 spec 模板，报路径解析错误。

**原因**：v5.0 中 `schemas/spec-driven/schema.yaml` 的 `specs` artifact 使用了 `templates/spec.md` 相对路径，与 CLI 的路径拼接逻辑冲突。

**状态**：**v5.1 已修复**。模板文件已移至 `schemas/_shared/templates/spec.md`，schema.yaml 中路径已更正为 `../_shared/templates/spec.md`。CLI 拼接逻辑无变化。

**workaround**（v5.0 使用者）：如遇此问题，可临时将 `schemas/_shared/templates/spec.md` 的内容复制到 `schemas/spec-driven/templates/spec.md`，或直接使用 `openspec instructions specs --change "<name>"` 验证路径解析。

---

### Q7: Schema Preflight 路径拼接在 Windows 上可能失败

**问题**：`openspec-apply` 等 skill 的 Schema Preflight 在 Windows 上可能因路径分隔符导致 `Test-Path` 失败。

**状态**：**v5.3 已修复**。`_xplat.ps1` 的 `Test-SchemaExists` 函数路径拼接逻辑已更正为使用绝对路径拼接。

### Q8: `openspec instructions review/test-design` 模板路径重复

**问题**：`schema.yaml` 中 `review` 和 `test-design` 的 `template` 字段使用 `templates/review.md` 相对路径，可能产生 `templates\templates\review.md` 的重复路径。

**状态**：**v5.3 已修复**。模板路径已更正为直接引用 `review.md` 和 `test-design.md`，文件已移动到 schema 根目录。

### Q9: GENERATE-INDEX.js 缺少 review/test-design category

**问题**：`SKILL-INDEX.md` 生成时 `review` 和 `test-design` 两个 category 无链接。

**状态**：**v5.3 已修复**。`order` 数组已添加这两个 category。

### Q10: 模板文件缺少 YAML frontmatter

**问题**：所有 schema 模板文件缺少 YAML frontmatter，与 SKILL.md 规范不一致。

**状态**：**v5.3 已修复**。7 个模板文件已添加标准 frontmatter。

---

## 已知限制

| 限制 | 严重程度 | 当前状态 | 解决方案 |
|------|---------|---------|---------|
| 项目不在 git 仓库 | Medium | 已知 | 纳入 git 管理，或接受全量验证降级 |
| CLI `show` 不搜索 archive | Low | 已有 workaround | 直接读取文件系统（见 Q4）或使用 archive-guide.md 命令 |
| CLI `new change` 不生成 artifacts | Low | 设计行为 | 使用 `/opsx-propose` 生成 |
| pnpm verify 命令指向不存在包 | Medium | 已修复为桩 | 实际项目替换为真实路径 |
| `health-check` config 孤立 | Low | 已修复 | 已从 config.yaml 删除 |
| `review`/`test-design` 模板路径重复 | Medium | **v5.3 已修复** | 模板已移至 `schemas/spec-driven/` 根目录 |
| GENERATE-INDEX.js 缺少 category | Low | **v5.3 已修复** | 已重新生成 SKILL-INDEX.md |
| 模板文件缺少 frontmatter | Low | **v5.3 已修复** | 7 个模板文件已添加标准 frontmatter |
| BOM 导致 PowerShell 报错 | Medium | 已知 | 使用 `-Command` 参数 |
| `specs` 模板路径拼接错误 | Medium | **v5.1 已修复** | 模板已移至 `schemas/_shared/templates/spec.md` |
