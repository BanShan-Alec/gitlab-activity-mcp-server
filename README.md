# GitLab Activity MCP

一个基于 Model Context Protocol (MCP) 的 GitLab 活动记录获取和报告生成服务器。

## 🚀 快速开始

### 使用 npx 直接运行

```bash
npx gitlab-activity-mcp
```

### 在 Claude Desktop 中配置

编辑你的 Claude Desktop 配置文件：

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

添加以下配置：

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

### 本地安装使用

```bash
# 全局安装
npm install -g gitlab-activity-mcp

# 运行
gitlab-activity-mcp
```

## 🔧 环境变量配置

| 变量名 | 必需 | 描述 | 示例 |
|--------|------|------|------|
| `GITLAB_BASE_URL` | ✅ | GitLab 实例的 API 基础 URL | `https://gitlab.com/api/v4` |
| `GITLAB_ACCESS_TOKEN` | ✅ | GitLab 访问令牌 (需要 read_user 或 api 权限) | `glpat-xxxxxxxxxxxxxxxxxxxx` |
| `GITLAB_CACHE_PATH` | ❌ | 缓存文件路径 | `./cache/gitlab-cache.json` |

### 获取 GitLab Access Token

1. 登录到你的 GitLab 实例
2. 进入 **设置** > **访问令牌** (Settings > Access Tokens)
3. 创建新的个人访问令牌
4. 选择以下权限：
   - `read_user` (读取用户信息)
   - `read_api` (读取 API)
5. 复制生成的令牌

## 🛠️ 可用工具 (Tools)

### `gitlab_activity_report`

获取指定用户的 GitLab 活动记录并生成 Markdown 报告。

#### 参数

| 参数名 | 类型 | 必需 | 描述 | 示例 |
|--------|------|------|------|------|
| `startDate` | string | ❌ | 开始日期 (ISO 8601 格式) | `2025-01-01` |
| `endDate` | string | ❌ | 结束日期 (ISO 8601 格式) | `2025-01-31` |

#### 使用示例

```
@gitlab-activity 获取我1月份的活动报告

@gitlab-activity 生成2024年12月1日到12月31日的活动总结
```

## 🤖 AI 提示模板 (Prompts)

### `monthly_report_summary`

将 GitLab 活动数据转换为专业的月度工作总结报告。

**参数：**
- `reportData`: 月度 GitLab 活动报告数据
- `reportStyle`: 报告风格 (`executive`, `technical`, `casual`, `formal`)
- `audience`: 目标受众 (`manager`, `team`, `client`, `self`)
- `highlightAchievements`: 是否突出显示主要成就
- `includeMetrics`: 是否包含量化指标
- `language`: 报告语言 (`zh`, `en`)

## 📊 功能特性

### 🔍 活动记录获取
- 自动获取指定时间范围内的 GitLab 活动
- 支持提交记录、合并请求等多种活动类型
- 智能缓存机制，减少API调用

### 📅 时间筛选
- 灵活的日期范围筛选
- 支持 ISO 8601 日期格式
- 自动处理时区转换

### 📊 智能分类
支持以下活动类型自动分类：

- 🐛 **Bug修复** (`bug_fix`) - 识别修复相关关键词
- ✨ **新功能** (`feature`) - 识别功能开发关键词  
- 🔧 **改进优化** (`improvement`) - 识别重构和优化关键词
- 📚 **文档更新** (`documentation`) - 识别文档相关关键词
- 🧪 **测试** (`test`) - 识别测试相关关键词
- ⚙️ **配置更改** (`config`) - 识别配置和CI相关关键词
- 📦 **其他** (`other`) - 未匹配到特定类型的活动

### 📝 报告生成
- 生成专业的 Markdown 格式报告
- 按项目分组展示活动记录
- 包含统计图表和数据分析
- 支持多种报告风格

### 🛡️ 错误处理
- 完善的错误处理和用户友好的错误信息
- 自动重试机制
- 详细的日志记录

## 📋 报告示例

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

**Bug 修复**
1. fix: 修复登录页面样式问题
2. fix: 解决数据同步异常
```

## 🔍 使用场景

### 个人开发者
- 快速生成工作总结
- 跟踪个人开发进度
- 准备绩效评估材料

### 团队管理者
- 监控团队开发活动
- 生成项目进度报告
- 分析开发效率趋势

### 项目经理
- 获取项目开发概览
- 生成客户汇报材料
- 跟踪里程碑完成情况

## 🐛 故障排除

### 常见问题

**Q: 提示 "GitLab 配置缺失" 错误**
A: 请检查环境变量配置，确保 `GITLAB_BASE_URL` 和 `GITLAB_ACCESS_TOKEN` 正确设置。

**Q: 无法获取活动数据**
A: 请确认：
1. GitLab 访问令牌权限正确
2. 网络连接正常
3. GitLab 实例可访问

**Q: 生成的报告为空**
A: 请检查：
1. 日期范围内是否有活动记录
2. 用户是否有相关项目的访问权限

### 日志查看

服务器运行时会输出详细的日志信息，包括：
- 初始化状态
- API 调用记录
- 错误信息和堆栈跟踪

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [GitLab API 文档](https://docs.gitlab.com/ee/api/)
- [Claude Desktop](https://claude.ai/desktop)