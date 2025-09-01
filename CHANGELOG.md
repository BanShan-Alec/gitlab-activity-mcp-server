# 更新日志

## [0.0.2] - 2025-01-13

### 🚀 新增功能

#### 缓存系统优化
- **24小时缓存**: 将缓存有效期从60分钟延长到24小时
- **Token感知缓存**: 用户缓存键改为使用 `GITLAB_ACCESS_TOKEN`
- **自动缓存清理**: 检测到 Access Token 变化时自动清空所有缓存

#### MCP 测试工具
- **MCP Inspector**: 引入 `@modelcontextprotocol/inspector` 用于测试
- **测试脚本**: 添加 `npm run inspector` 和 `npm run test:mcp` 命令
- **测试文档**: 新增详细的 MCP 测试指南

### 🔧 技术改进

#### 缓存策略升级
```typescript
// 之前: 60分钟缓存，固定键名
const cacheKey = 'current';
cacheDurationMinutes = 60;

// 现在: 24小时缓存，Token敏感
const cacheKey = accessToken;
cacheDurationHours = 24;
```

#### Token变化检测
```typescript
interface CacheData {
  users: Record<string, { data: any; timestamp: number; }>;
  projects: Record<string, { data: any; timestamp: number; }>;
  accessToken?: string; // 🆕 记录当前使用的 access token
}
```

### 📖 文档更新

- **缓存指南**: 更新缓存时长和策略说明
- **测试文档**: 新增 `examples/mcp-testing.md`
- **更新日志**: 新增此文档记录版本变化

### ⚡ 性能提升

- **长期缓存**: 24小时缓存显著减少API调用
- **智能清理**: Token变化时精准清理，避免过期数据
- **单用户优化**: 每个Token只缓存一个用户的数据

### 🛠️ 开发体验

- **可视化测试**: MCP Inspector 提供 Web 界面测试
- **快速验证**: 一键启动测试环境
- **实时调试**: 详细的执行日志和错误信息

## [0.0.1] - 2025-01-12

### 🎉 初始版本

#### 核心功能
- **GitLab 活动获取**: 通过 GitLab API 获取用户活动记录
- **智能分类**: 自动分类提交类型（新功能、Bug修复、改进等）
- **报告生成**: 生成详细的 Markdown 活动报告
- **时间筛选**: 支持按日期范围筛选活动

#### AI 分析模板
- **活动分析**: 性能评估、趋势分析、深度洞察、改进建议
- **月报生成**: 多种风格的专业月度报告
- **绩效评估**: 自评、同事评估、管理者评估
- **职业规划**: 基于活动数据的发展建议

#### 技术架构
- **MCP Framework**: 基于 v0.2.2 构建
- **服务式架构**: GitLabAuthService、CacheService、GitLabService
- **类型安全**: 完整的 TypeScript 类型定义
- **数据验证**: Zod schema 严格验证

#### 缓存系统
- **LowDB**: JSON 本地持久化缓存
- **智能缓存**: 用户信息和项目信息缓存
- **自动管理**: 过期检查和清理机制

---

## 版本规划

### 下一版本 (0.0.3)
- [ ] 批量项目分析优化
- [ ] 更多的 GitLab 事件类型支持
- [ ] 自定义分析规则配置
- [ ] 导出多种格式支持

### 未来版本
- [ ] Web 界面支持
- [ ] 团队分析功能
- [ ] 集成其他代码托管平台
- [ ] 高级数据可视化
