# General Openspec v0.1

> OpenSpec Skill 系统的可移植版本，可复制到任何项目作为 spec-driven 开发框架。

## 内容

```
.
├── .cursor/                          # 隐藏文件夹（需显示隐藏项目）
│   ├── commands/                      # 13 个 Slash 命令入口
│   │   ├── opsx-onboard.md
│   │   ├── opsx-sync.md
│   │   ├── opsx-explore.md
│   │   ├── opsx-propose.md
│   │   ├── opsx-review.md
│   │   ├── opsx-apply.md
│   │   ├── opsx-verify.md
│   │   ├── opsx-archive.md
│   │   ├── opsx-debug.md
│   │   ├── opsx-plan.md
│   │   ├── opsx-continue.md
│   │   ├── opsx-skip.md
│   │   └── opsx-sync-specs.md
│   └── skills/                        # 15 个 OpenSpec 技能 + 5 个 GA 技能
│       ├── openspec-onboard/
│       ├── openspec-sync/
│       ├── openspec-sync-specs/
│       ├── openspec-explore/
│       ├── openspec-propose/
│       ├── openspec-review/           # 含 Test Design
│       ├── openspec-apply/
│       ├── openspec-continue/
│       ├── openspec-skip/
│       ├── openspec-verify/
│       ├── openspec-archive/
│       ├── openspec-debug/
│       ├── openspec-plan/
│       ├── openspec-skill/
│       ├── ga-upgrade/
│       ├── ga-export/
│       ├── ga-test/
│       ├── ga-report/
│       ├── ga-skill/
│       └── _shared/
│
└── openspec/
    ├── schemas/                       # Artifact schema 定义
    ├── specs/                         # 技能系统设计规范
    └── config.yaml                    # 项目配置
```

## 使用方法

### 1. 复制到目标项目

将整个目录内容复制到你的项目根目录（`.cursor` 文件夹需要显示隐藏项目才能看到）。

### 2. 安装前提

```bash
npm install -g @fission-ai/openspec@latest
```

### 3. 初始化

在 Cursor 中运行：

```
/opsx-onboard
```

### 4. 开始工作流

```
/opsx-propose <name>  → 创建 change
/opsx-review           → 评审 design 决策
/opsx-apply           → 实现 tasks
/opsx-verify          → 验证实现一致性
/opsx-archive         → 归档完成的 change
```

## Change 生命周期

```
┌─────────────────────────────────────────────────────────┐
│  /opsx-propose <name>                                  │
│  自动检测初始化 → 推断 change_class → 生成 artifacts    │
│  ↓                                                      │
│  /opsx-review                                          │
│  结构分析闭环 → 评审 design 决策                        │
│  ↓                                                      │
│  /opsx-apply                                           │
│  按 layer 优先级执行 → 增量验证 → 断点续传             │
│  ↓ 遇到问题                                             │
│  /opsx-debug                                           │
│  诊断 → 修复 → 继续 apply                              │
│  ↓ 所有 task 完成                                       │
│  /opsx-verify                                          │
│  Full + coherence-lite                                  │
│  ↓ 全部通过                                             │
│  /opsx-archive                                         │
│  最终确认 → 归档                                         │
└─────────────────────────────────────────────────────────┘
```

## Layer 执行优先级

```
engine > backend > editor > runtime > ui-skin > meta
```

## 版本

v0.1 — General Openspec 独立版本体系
