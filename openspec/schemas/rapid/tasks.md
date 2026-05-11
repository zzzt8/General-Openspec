# Tasks — <!-- change-name -->

## BCF 实现

<!-- 对应 proposal.md 中 BCF 表的每一行。验收通过即标记 [x]。 -->

- [ ] BCF-1: <!-- 简要描述验证过程和结果 -->

## Layer 实现

<!-- 按 layer 优先级执行：engine > backend > editor > runtime > ui-skin > meta -->

### engine
<!-- 核心业务逻辑、状态管理、数据层 -->

- [ ] T1:

### backend
<!-- API 接口、数据模型、数据库变更 -->

- [ ] T2:

### editor
<!-- 编辑器相关逻辑 -->

- [ ] T3:

### runtime
<!-- 主应用运行时逻辑 -->

- [ ] T4:

### ui-skin
<!-- UI 组件、样式、交互 -->

- [ ] T5: 按钮/链接/表单控件全部绑定真实 handler

## 质量门禁

- [ ] 代码通过 typecheck
- [ ] 无点击无响应的占位组件（无 `onClick={() => {}}` 或空 handler）
- [ ] UI / executor / workflow JSON 正确消费了关键数据字段（如 nodeId、portId、workflowId、assetId、imageUrl、params）

## 交付确认

<!-- 用户在确认所有 task 完成后操作 -->

- [ ] 所有 BCF 已在真实运行链路上验证通过（dev-tool → workflow JSON → executor → 输出）
- [ ] 用户确认交付，同意提交
