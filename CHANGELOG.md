# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.0.3


### 🚀 Enhancements

- Enhance activity classification and reporting ([a2b7d76](https://github.com/BanShan-Alec/gitlab-activity-mcp-server/commit/a2b7d76))
- 修复git commit 会丢失的问题 ([26ac31b](https://github.com/BanShan-Alec/gitlab-activity-mcp-server/commit/26ac31b))

### 🩹 Fixes

- Update project statistics to use project names instead of IDs ([2824b4d](https://github.com/BanShan-Alec/gitlab-activity-mcp-server/commit/2824b4d))

### 💅 Refactors

- Improve Markdown report formatting ([4073b5b](https://github.com/BanShan-Alec/gitlab-activity-mcp-server/commit/4073b5b))

### 📖 Documentation

- 更新README ([36c13a1](https://github.com/BanShan-Alec/gitlab-activity-mcp-server/commit/36c13a1))
- 更新CHANGELOG和使用示例文档 ([1a2d816](https://github.com/BanShan-Alec/gitlab-activity-mcp-server/commit/1a2d816))
- 引入docs 工作流，补充当前项目文档到docs ([c761056](https://github.com/BanShan-Alec/gitlab-activity-mcp-server/commit/c761056))

### 🏡 Chore

- Prettier 格式化全局 ([b3012fa](https://github.com/BanShan-Alec/gitlab-activity-mcp-server/commit/b3012fa))
- Update package metadata and remove date-fns dependency ([9741393](https://github.com/BanShan-Alec/gitlab-activity-mcp-server/commit/9741393))
- Remove gitlab-cache.json file ([5be93ad](https://github.com/BanShan-Alec/gitlab-activity-mcp-server/commit/5be93ad))
- Update package configuration and improve date validation ([09d0c47](https://github.com/BanShan-Alec/gitlab-activity-mcp-server/commit/09d0c47))
- Bump version to 0.0.2 in package.json ([32d0036](https://github.com/BanShan-Alec/gitlab-activity-mcp-server/commit/32d0036))
- 升级mcp-framework 版本 ([98219d3](https://github.com/BanShan-Alec/gitlab-activity-mcp-server/commit/98219d3))

### ❤️ Contributors

- Wengzehua <wengzehua@cvte.com>

## [1.0.0] - 2025-01-09

### 🎉 首次发布

这是 GitLab Activity MCP 的首个正式版本，提供完整的 GitLab 活动报告功能。

### ✨ 新增功能

#### 核心功能
- **GitLab 活动获取**: 从 GitLab API 获取用户活动记录
- **智能活动分类**: 基于关键词自动分类提交类型
  - 🐛 Bug修复 (`bug_fix`)
  - ✨ 新功能 (`feature`) 
  - 🔧 改进优化 (`improvement`)
  - 📚 文档更新 (`documentation`)
  - 🧪 测试 (`test`)
  - ⚙️ 配置更改 (`config`)
  - 📦 其他 (`other`)
- **Markdown 报告生成**: 生成结构化的活动报告
- **统计分析**: 提供按类型和项目的统计信息

#### MCP 工具和提示
- **`gitlab_activity_report`** 工具: 获取并生成活动报告
- **`monthly_report_summary`** 提示: 生成专业的月度总结

#### 支持的配置
- 灵活的时间范围筛选 (`startDate`, `endDate`)
- 自定义 GitLab 实例支持
- 可配置的缓存机制

### 🔧 技术实现

#### 架构设计
- **模块化服务**: `GitLabService`, `CacheService`, `EventAnalyst`
- **类型安全**: 完整的 TypeScript 类型定义
- **错误处理**: 完善的异常处理和用户友好的错误信息
- **缓存优化**: 智能缓存减少 API 调用

#### 开发工具
- **构建系统**: TypeScript + MCP Build 工具
- **代码格式化**: Prettier 配置
- **依赖管理**: pnpm 包管理器
- **npm 发布**: 自动化构建和依赖处理

### 📦 包发布配置

#### npm 包信息
- **包名**: `gitlab-activity-mcp`
- **命令**: `npx gitlab-activity-mcp`
- **版本**: 1.0.0
- **许可证**: MIT

#### 环境要求
- **Node.js**: >=18.19.0
- **GitLab API**: v4
- **权限**: read_user 或 api

### 📚 文档

#### 完整文档
- **README.md**: 中文完整使用指南
- **examples/usage-example.md**: 详细使用示例
- **API 文档**: 工具和提示的完整参数说明

#### 使用指南
- Claude Desktop 配置示例
- 环境变量配置说明
- 故障排除指南
- 多种使用场景示例

### 🎯 使用场景

- **个人开发者**: 快速生成工作总结和进度跟踪
- **团队管理者**: 监控团队开发活动和项目进度
- **项目经理**: 生成项目报告和客户汇报材料
- **绩效评估**: 提供量化的开发活动数据

### 🔒 安全性

- **访问控制**: 仅使用必要的 GitLab API 权限
- **数据隐私**: 本地缓存，不上传敏感信息
- **配置验证**: 启动时验证 GitLab 连接和权限

### 🚀 性能优化

- **智能缓存**: 减少重复 API 调用
- **批量处理**: 高效的数据处理和转换
- **错误重试**: 自动处理网络异常

## [未来计划]

### v1.1.0 计划功能
- [ ] 支持更多 GitLab 活动类型 (Issues, Merge Requests)
- [ ] 支持自定义报告模板

### v1.2.0 计划功能
- [ ] 集成更多 AI 分析功能
- [ ] 支持导出到多种格式 (PDF, Excel)

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件