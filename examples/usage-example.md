# GitLab Activity MCP 使用示例

## 1. 快速开始

### 使用 npx 直接运行
```bash
npx gitlab-activity-mcp
```

### 全局安装后使用
```bash
# 安装
npm install -g gitlab-activity-mcp

# 运行
gitlab-activity-mcp
```

## 2. Claude Desktop 配置

### 配置文件位置
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### 基本配置
```json
{
  "mcpServers": {
    "gitlab-activity": {
      "command": "npx",
      "args": ["gitlab-activity-mcp"],
      "env": {
        "GITLAB_BASE_URL": "https://gitlab.com/api/v4",
        "GITLAB_ACCESS_TOKEN": "glpat-xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

### 带缓存路径的配置
```json
{
  "mcpServers": {
    "gitlab-activity": {
      "command": "npx",
      "args": ["gitlab-activity-mcp"],
      "env": {
        "GITLAB_BASE_URL": "https://gitlab.com/api/v4",
        "GITLAB_ACCESS_TOKEN": "glpat-xxxxxxxxxxxxxxxxxxxx",
        "GITLAB_CACHE_PATH": "./cache/gitlab-cache.json"
      }
    }
  }
}
```

### 私有 GitLab 实例配置
```json
{
  "mcpServers": {
    "gitlab-activity": {
      "command": "npx",
      "args": ["gitlab-activity-mcp"],
      "env": {
        "GITLAB_BASE_URL": "https://gitlab.your-company.com/api/v4",
        "GITLAB_ACCESS_TOKEN": "glpat-xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

## 3. 工具使用示例

### 获取指定时间范围的活动报告

```
@gitlab-activity 生成我2025年1月份的活动报告
```

对应的工具调用：
```json
{
  "tool": "gitlab_activity_report",
  "parameters": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  }
}
```

### 获取最近一个月的活动
```
@gitlab-activity 获取我最近30天的开发活动
```

对应的工具调用：
```json
{
  "tool": "gitlab_activity_report",
  "parameters": {
    "startDate": "2024-12-01",
    "endDate": "2024-12-31"
  }
}
```

### 获取最近的活动（不指定结束日期）
```
@gitlab-activity 生成从12月1日开始的活动总结
```

对应的工具调用：
```json
{
  "tool": "gitlab_activity_report",
  "parameters": {
    "startDate": "2024-12-01"
  }
}
```

### 获取所有活动（不指定日期范围）
```
@gitlab-activity 生成我的完整活动报告
```

对应的工具调用：
```json
{
  "tool": "gitlab_activity_report",
  "parameters": {}
}
```

## 4. 提示模板使用示例

### 生成月度工作总结

```
请使用 monthly_report_summary 提示，帮我生成一份技术风格的月度总结报告，面向团队，包含量化指标，使用中文。

reportData: [这里粘贴 gitlab_activity_report 的输出结果]
```

对应的提示调用：
```json
{
  "prompt": "monthly_report_summary",
  "parameters": {
    "reportData": "...",
    "reportStyle": "technical",
    "audience": "team",
    "highlightAchievements": true,
    "includeMetrics": true,
    "language": "zh"
  }
}
```

## 5. 高级用法示例

### 自然语言查询
```
@gitlab-activity 我想看看这个季度的开发成果，重点关注新功能和Bug修复

@gitlab-activity 生成一份适合给经理看的工作报告，突出我的主要贡献

@gitlab-activity 分析我最近的代码提交模式，看看有什么可以改进的地方
```

### 组合使用工具和提示
1. 首先获取活动数据：
   ```
   @gitlab-activity 获取我1月份的活动报告
   ```

2. 然后使用提示生成总结：
   ```
   请基于上面的数据，生成一份高管风格的总结报告，突出主要成就。
   ```

## 6. 预期输出示例

### 详细报告输出
```markdown
# GitLab 活动报告（2025/1/1 – 2025/1/31）

> 基于 GitLab Activity MCP 自动拉取的 45 条活动记录

| 指标             | 数量 |
| ---------------- | ---- |
| 总活动           | 45   |
| 新功能 (feat)    | 12   |
| Bug 修复 (fix)   | 18   |
| 改进 / 重构等     | 10   |
| 其他（文档、配置等） | 5    |

---

## 按项目拆分

### 🏗️ my-awesome-project (23 次提交 / MR)

**主要新功能**
1. feat: 添加用户认证系统
2. feat: 实现数据导出功能
3. feat: 集成第三方支付API

**Bug 修复**
1. fix: 修复登录页面样式问题
2. fix: 解决数据同步异常
3. fix: 修复移动端适配问题

**改进优化**
1. refactor: 重构用户模块代码
2. perf: 优化数据库查询性能
3. style: 统一代码格式

### 🔧 utility-library (12 次提交 / MR)

**主要更新**
1. feat: 添加新的工具函数
2. test: 完善单元测试覆盖
3. docs: 更新API文档
```

### 简要统计输出
```markdown
## 活动统计摘要

📈 **本月开发概览**
- 总活动：45 项
- 涉及项目：3 个
- 主要类型：新功能开发 (27%)、Bug修复 (40%)、改进优化 (22%)

🎯 **重点成就**
- 完成用户认证系统开发
- 修复了18个关键Bug
- 优化了系统性能和代码质量
```

## 7. 故障排除

### 配置问题
如果遇到配置错误，检查：
1. GitLab URL 格式是否正确 (需要包含 `/api/v4`)
2. Access Token 权限是否足够
3. 网络连接是否正常

### 数据为空
如果报告为空，检查：
1. 指定日期范围内是否有活动
2. 用户权限是否足够访问相关项目
3. GitLab 实例是否可正常访问

### 性能优化
如果响应较慢：
1. 缩小日期范围
2. 启用缓存功能
3. 检查网络连接质量