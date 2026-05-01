# Archive Guide

> **v5.3** | OpenSpec Skill System

> 本文档说明 OpenSpec change 归档后的操作方式。由 `openspec-archive` skill 和 `openspec-verify` skill 在归档完成后引用。

## 归档目录结构

归档后的 change 存放在 `openspec/changes/archive/` 目录下：

```
openspec/changes/archive/
└── <YYYY-MM-DD>-<change-name>/
    ├── .openspec.yaml
    ├── proposal.md
    ├── design.md
    ├── review.md
    ├── test-design.md
    ├── tasks.md
    ├── repo-analysis.md
    └── specs/
        └── <capability>/
            └── spec.md
```

## CLI 限制说明

官方 CLI 的 `openspec show <change-name>` 命令**只在** `openspec/changes/` 下查找 change 目录。归档后目录移入 `archive/`，CLI 无法直接定位。

这是上游 CLI 的设计行为，并非 bug。Skill 层通过直接读取文件系统绕过此限制。

## 查看归档内容

### PowerShell 命令（Windows 推荐）

```powershell
# 列出所有已归档 change（按日期倒序）
Get-ChildItem openspec/changes/archive/ | Sort-Object LastWriteTime -Descending

# 搜索特定名称的归档
Get-ChildItem openspec/changes/archive/ | Where-Object { $_.Name -like "*<change-name>*" }

# 查看归档元数据
Get-Content openspec/changes/archive/<date>-<change-name>/.openspec.yaml

# 查看 proposal
Get-Content openspec/changes/archive/<date>-<change-name>/proposal.md

# 查看 design
Get-Content openspec/changes/archive/<date>-<change-name>/design.md

# 查看 tasks
Get-Content openspec/changes/archive/<date>-<change-name>/tasks.md

# 查看所有 artifact 文件
Get-ChildItem openspec/changes/archive/<date>-<change-name>/ -Recurse -File | Select-Object Name
```

### Bash / Unix 命令（跨平台）

```bash
# 列出所有已归档 change（按日期倒序）
ls -t openspec/changes/archive/

# 搜索特定名称的归档
ls openspec/changes/archive/ | grep "<change-name>"

# 查看归档元数据
cat openspec/changes/archive/<date>-<change-name>/.openspec.yaml

# 列出归档目录下所有文件
find openspec/changes/archive/<date>-<change-name>/ -type f -name "*.md"
```

### 通过 CLI 查看归档（workaround）

CLI 本身不支持直接查看归档，但可以通过以下方式获取信息：

```powershell
# 1. 从 .openspec.yaml 读取元数据（相当于 openspec show）
Get-Content "openspec/changes/archive/<date>-<change-name>/.openspec.yaml"

# 2. 从 proposal.md 提取 change 名称和状态
Select-String -Path "openspec/changes/archive/<date>-<change-name>/proposal.md" -Pattern "^name:|^status:|^change_class:" -Context 0,1

# 3. 验证归档完整性（相当于 openspec validate）
$archiveDir = "openspec/changes/archive/<date>-<change-name>"
$required = @(".openspec.yaml", "proposal.md", "design.md", "review.md", "specs")
$missing = $required | Where-Object { -not (Test-Path "$archiveDir/$_") }
if ($missing) {
    Write-Host "WARNING: Missing artifacts: $($missing -join ', ')" -ForegroundColor Yellow
} else {
    Write-Host "Archive integrity OK" -ForegroundColor Green
}
```

### 提取关键信息

```powershell
# 提取 change 名称和日期
$archiveDir = "openspec/changes/archive/<date>-<change-name>"
$yaml = Get-Content "$archiveDir/.openspec.yaml" -Raw
if ($yaml -match "name:\s*(.+)") { $matches[1].Trim() }
if ($yaml -match "status:\s*(.+)") { $matches[1].Trim() }

# 提取 proposal 中的变更动机（Why）
Select-String -Path "$archiveDir/proposal.md" -Pattern "^##?\s*变更动机|^##?\s*Why" -Context 2,0

# 查看 tasks 完成状态（归档时快照）
Select-String -Path "$archiveDir/tasks.md" -Pattern "^- \[x\]\s|^- \[S\]\s|^- \[ \]\s" |
    ForEach-Object { $_.Line }

# 查看 spec 列表
Get-ChildItem "$archiveDir/specs" -Directory | ForEach-Object { $_.Name }
```

## 恢复归档的 change

归档后的 change **不应直接恢复**。如果需要重新激活，应：

1. 从归档的 `proposal.md` 复制内容
2. 运行 `/opsx-propose <feature-name>` 创建新 change
3. 将归档内容迁移到新 change 的 artifacts 中

```powershell
# 读取归档 proposal 作为参考
Get-Content openspec/changes/archive/<date>-<old-change>/proposal.md

# 归档中的 specs 可以直接复用
Copy-Item -Recurse "openspec/changes/archive/<date>-<old-change>/specs/" `
          "openspec/changes/<new-change>/specs/"
```

## 强制归档后的操作

当 verify 未通过但用户选择强制归档时：

1. 强制归档原因已记录在 `proposal.md` frontmatter 的 `force_archive_reason` 字段中
2. 归因分析（如有）记录在 `review.md` 中
3. 后续如需修复，创建新 change 承接相关工作

```powershell
# 查看强制归档原因
Select-String -Path "openspec/changes/archive/<date>-<change-name>/proposal.md" `
             -Pattern "force_archive_reason|force_archive_date" -Context 0,1

# 查看归因记录（相关测试失败）
Select-String -Path "openspec/changes/archive/<date>-<change-name>/review.md" `
             -Pattern "归因|attribution|related|undetermined" -Context 1,0
```

## 相关文件

- [test-artifacts/](../test-artifacts/) — 测试 fixture（JSON）和测试执行产物（Node.js）
- [.cursor/skills/_shared/GENERATE-CONFIG.js](../../.cursor/skills/_shared/GENERATE-CONFIG.js) — config.yaml 生成脚本
- [.cursor/skills/_shared/GENERATE-INDEX.js](../../.cursor/skills/_shared/GENERATE-INDEX.js) — SKILL-INDEX.md 生成脚本
- [openspec/changes/archive/](../changes/archive/) — 已归档 change（可参考归档目录结构）
- [faq-known-issues.md](./faq-known-issues.md) — 已知问题和 FAQ
- [CHANGELOG-V5.3.md](./CHANGELOG-V5.3.md) — V5.3 变更日志
