# GitLab Activity MCP Server

一个基于 Model Context Protocol (MCP) 的 GitLab 活动记录获取和报告生成服务器。

## 功能特性

- 🔍 获取指定用户的 GitLab 活动记录
- 📅 支持时间区间筛选 (after/before 参数)
- 📊 智能分类提交类型（新功能、Bug修复、改进优化等）
- 📝 生成详细的 Markdown 报告或简要摘要
- 🏗️ 按项目分组展示活动记录
- 🛡️ 完善的错误处理和用户友好的错误信息
- 🤖 提供多种 AI Prompt 模板用于深度分析

## 安装和构建

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm run build

# 启动服务器
pnpm start
```

## 工具 (Tools)

### `gitlab_activity_report`

获取指定用户的 GitLab 活动记录并生成 Markdown 报告。

#### 参数

| 参数名      | 类型   | 必需 | 描述                     | 示例         |
| ----------- | ------ | ---- | ------------------------ | ------------ |
| `startDate` | string | ❌   | 开始日期 (ISO 8601 格式) | `2025-01-01` |
| `endDate`   | string | ❌   | 结束日期 (ISO 8601 格式) | `2025-01-31` |

#### 环境变量配置

| 变量名                | 必需 | 描述                                         | 示例                         |
| --------------------- | ---- | -------------------------------------------- | ---------------------------- |
| `GITLAB_BASE_URL`     | ✅   | GitLab 实例的 API 基础 URL                   | `https://gitlab.com/api/v4`  |
| `GITLAB_ACCESS_TOKEN` | ✅   | GitLab 访问令牌 (需要 read_user 或 api 权限) | `glpat-xxxxxxxxxxxxxxxxxxxx` |
| `GITLAB_CACHE_PATH`   | ❌   | 缓存文件路径                                 | `./cache/gitlab-cache.json`  |

## AI Prompt 模板 (Prompts)

### `gitlab_activity_analysis`

分析 GitLab 活动数据，提供深度洞察和专业建议。

**参数：**

- `reportData`: GitLab 活动报告的原始数据
- `analysisType`: 分析类型 (`performance`, `trends`, `insights`, `recommendations`)
- `timeframe`: 时间范围（例如：月度、季度、年度）
- `focusAreas`: 重点关注领域

**分析类型：**

- 🎯 **performance** - 个人/团队绩效评估
- 📈 **trends** - 工作模式和技术趋势分析
- 💡 **insights** - 深度行为模式洞察
- 📋 **recommendations** - 专业改进建议

### `monthly_report_summary`

将 GitLab 活动数据转换为专业的月度工作总结报告。

**参数：**

- `reportData`: 月度 GitLab 活动报告数据
- `reportStyle`: 报告风格 (`executive`, `technical`, `casual`, `formal`)
- `audience`: 目标受众 (`manager`, `team`, `client`, `self`)
- `highlightAchievements`: 是否突出显示主要成就
- `includeMetrics`: 是否包含量化指标
- `language`: 报告语言 (`zh`, `en`)

**报告风格：**

- 📊 **executive** - 高管总结报告
- 🔧 **technical** - 技术详细报告
- 💬 **casual** - 日常汇报
- 📋 **formal** - 正式报告

### `performance_review`

基于 GitLab 活动数据生成专业的绩效评估报告。

**参数：**

- `reportData`: GitLab 活动报告数据
- `reviewPeriod`: 评估周期 (`quarterly`, `semi_annual`, `annual`)
- `reviewType`: 评估类型 (`self`, `peer`, `manager`)
- `competencyFramework`: 能力框架维度
- `careerLevel`: 职业级别 (`junior`, `mid`, `senior`, `lead`, `principal`)
- `includeGoalSetting`: 是否包含目标设定

### `career_development`

基于 GitLab 活动数据制定个人职业发展规划。

**参数：**

- `reportData`: GitLab 活动报告数据
- `currentRole`: 当前职位/角色
- `careerGoals`: 职业发展目标
- `timeHorizon`: 规划时间范围 (`6months`, `1year`, `2years`, `5years`)
- `focusAreas`: 重点发展领域
- `includeSkillGaps`: 是否包含技能差距分析
- `includeActionPlan`: 是否包含行动计划

## MCP 配置示例

```json
{
  "mcpServers": {
    "gitlab-activity": {
      "command": "node",
      "args": ["/path/to/gitlab-activity-mcp-server/dist/index.js"],
      "env": {
        "GITLAB_BASE_URL": "https://gitlab.com/api/v4",
        "GITLAB_ACCESS_TOKEN": "glpat-xxxxxxxxxxxxxxxxxxxx",
        "GITLAB_CACHE_PATH": "./cache/gitlab-cache.json"
      }
    }
  }
}
```

## 使用示例

### 基本使用

**获取活动报告：**

```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

**仅指定开始日期：**

```json
{
  "startDate": "2025-01-01"
}
```

**获取所有活动（不指定日期）：**

```json
{}
```

### AI 分析使用

**性能分析：**

```json
{
  "reportData": "... GitLab 报告数据 ...",
  "analysisType": "performance",
  "timeframe": "月度",
  "focusAreas": ["代码质量", "团队协作"]
}
```

**月报生成：**

```json
{
  "reportData": "... GitLab 报告数据 ...",
  "reportStyle": "formal",
  "audience": "manager",
  "language": "zh"
}
```

## GitLab 访问令牌设置

1. 登录 GitLab
2. 进入 **用户设置** → **访问令牌**
3. 创建新的个人访问令牌
4. 选择以下权限之一：
   - `read_user` - 读取用户信息和活动
   - `api` - 完整的 API 访问权限

## 支持的 GitLab 实例

- GitLab.com (`https://gitlab.com/api/v4`)
- GitLab 私有部署实例 (`https://your-gitlab.com/api/v4`)
- GitLab 企业版实例

## 报告示例

生成的详细报告包含：

- 📊 活动统计概览
- 🏗️ 按项目分组的详细信息
- 🆕 新功能开发记录
- 🐛 Bug 修复列表
- ⚡ 改进和优化项目
- 📋 其他类型的提交

生成的摘要报告包含：

- 🎯 总体统计数据
- 📈 提交分类统计
- 🚀 最活跃的项目列表

## 工作流示例

1. **获取数据** → 使用 `gitlab_activity_report` 工具获取原始活动数据
2. **生成报告** → 使用 `monthly_report_summary` 生成专业月报
3. **深度分析** → 使用 `gitlab_activity_analysis` 进行趋势和绩效分析
4. **职业规划** → 使用 `career_development` 制定发展计划

## 错误处理

服务器提供详细的错误信息帮助诊断问题：

- **401 认证失败**: 访问令牌无效或过期
- **403 权限不足**: 访问令牌权限不够
- **404 用户不存在**: 指定的用户 ID/用户名不存在
- **网络错误**: GitLab 实例不可访问

## 技术架构

- **框架**: MCP Framework v0.2.2
- **语言**: TypeScript
- **HTTP 客户端**: MCP Framework 内置 fetch
- **认证**: GitLabAuthService 服务
- **缓存**: LowDB JSON 持久化缓存
- **数据验证**: Zod
- **构建工具**: TypeScript Compiler + MCP Build

## 开发

```bash
# 监听文件变化并重新编译
pnpm run watch

# 验证工具定义
mcp validate

# 使用 MCP Inspector 测试
npm run inspector

# 带测试环境变量的 Inspector
npm run test:mcp
```

## 许可证

MIT License

---

> 由 **GitLab Activity MCP Server** 提供技术支持
