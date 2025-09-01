# 使用示例

## 基本使用

### 1. 获取指定时间范围的活动报告

```json
{
  "tool": "gitlab_activity_report",
  "parameters": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  }
}
```

### 2. 获取某个月的活动

```json
{
  "tool": "gitlab_activity_report",
  "parameters": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  }
}
```

### 3. 获取最近的活动（不指定结束日期）

```json
{
  "tool": "gitlab_activity_report",
  "parameters": {
    "startDate": "2025-01-01"
  }
}
```

### 4. 获取所有活动（不指定日期范围）

```json
{
  "tool": "gitlab_activity_report",
  "parameters": {}
}
```

## Claude Desktop 配置

在 Claude Desktop 的配置文件中添加：

```json
{
  "mcpServers": {
    "gitlab-activity": {
      "command": "node",
      "args": ["/path/to/gitlab-activity-mcp-server/dist/index.js"],
      "env": {
        "GITLAB_BASE_URL": "https://gitlab.com/api/v4",
        "GITLAB_ACCESS_TOKEN": "glpat-xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

或者如果项目已发布到 npm：

```json
{
  "mcpServers": {
    "gitlab-activity": {
      "command": "npx",
      "args": ["gitlab-activity-mcp-server"],
      "env": {
        "GITLAB_BASE_URL": "https://gitlab.com/api/v4",
        "GITLAB_ACCESS_TOKEN": "glpat-xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

## 预期输出示例

### 详细报告输出

```markdown
# GitLab 活动报告（2025/1/1 – 2025/1/31）

> 基于 GitLab Activity MCP 自动拉取的 45 条活动记录

| 指标                 | 数量 |
| -------------------- | ---- |
| 总活动               | 45   |
| 新功能 (feat)        | 12   |
| Bug 修复 (fix)       | 18   |
| 改进 / 重构等        | 10   |
| 其他（文档、配置等） | 5    |

---

## 按项目拆分

### 🏗️ my-awesome-project (23 次提交 / MR)

**主要新功能**

1. feat: 添加用户认证系统
2. feat: 实现数据导出功能
3. feat: 新增邮件通知服务

**关键 Bug 修复**

- fix: 修复登录页面样式问题
- fix: 解决数据同步异常
- fix: 修正 API 响应格式错误

**改进 / 优化**

- refactor: 优化数据库查询性能
- style: 统一代码格式
- chore: 更新依赖包版本

---

> 以上内容由 **gitlab-activity-mcp** 工具自动汇总生成。
```

### 摘要报告输出

```
📊 **GitLab 活动摘要 (2025/1/1 - 2025/1/31)**

🎯 **总体统计**
- 总活动数：45
- 涉及项目：3 个
- 总提交数：23

📈 **提交分类**
- 新功能：12 个
- Bug修复：18 个
- 改进优化：10 个
- 其他：5 个

🚀 **活跃项目**
- my-awesome-project: 23 次提交
- frontend-ui: 15 次提交
- api-service: 7 次提交
```

## 常见用法场景

1. **月度工作总结**: 生成指定月份的工作报告
2. **项目进度汇报**: 分析项目开发进展和贡献情况
3. **团队活动统计**: 获取团队成员的开发活动概览
4. **代码审查准备**: 了解期间内的主要功能开发和修复
