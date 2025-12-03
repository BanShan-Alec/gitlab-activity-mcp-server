# GitLab Activity MCP Server - 项目概览

> **生成时间**: 2025年1月17日  
> **版本**: 0.0.2  
> **状态**: 生产就绪

## 🎯 项目概述

**GitLab Activity MCP Server** 是一个基于 Model Context Protocol (MCP) 的 GitLab 活动记录获取和报告生成服务器。它能够自动拉取 GitLab 用户的活动数据，智能分析并生成专业的 Markdown 格式活动报告。

### 核心价值

- 🤖 **AI集成友好**: 基于MCP协议，可与Claude等AI助手无缝集成
- 📊 **智能分析**: 自动分类活动类型（功能开发、bug修复、文档更新等）
- 📝 **专业报告**: 生成结构化、可视化的Markdown报告
- 🚀 **即用即走**: 支持npx直接运行，无需本地安装

## 🏗️ 技术栈

### 运行时环境

- **Node.js**: ≥18.19.0
- **TypeScript**: 5.3.3 (开发语言)
- **ES Modules**: 现代模块系统

### 核心框架

- **mcp-framework**: 0.2.15 - MCP服务器框架
- **Zod**: 3.22.4 - 数据验证和类型安全
- **LowDB**: 7.0.1 - 轻量级JSON数据库(缓存)

### 开发工具

- **TypeScript Compiler**: 构建工具
- **Prettier**: 代码格式化
- **dotenv-cli**: 环境变量管理
- **MCP Inspector**: 调试工具

## 🚀 启动方式

### 生产部署

```bash
# NPX 直接运行(推荐)
npx gitlab-activity-mcp

# 全局安装
npm install -g gitlab-activity-mcp
gitlab-activity-mcp
```

### 开发模式

```bash
# 构建项目
npm run build

# 启动服务(开发)
npm start

# 调试模式
npm run inspect

# 监听模式
npm run watch
```

## 🏭 项目架构

### 目录结构

```
src/
├── index.ts                 # 🚪 应用入口
├── tools/                   # 🛠️ MCP工具定义
│   └── GitLabActivityTool.ts
├── services/                # ⚙️ 业务服务层
│   ├── GitLabService.ts     # GitLab API交互
│   └── CacheService.ts      # 数据缓存服务
├── utils/                   # 🔧 工具函数
│   ├── ReportGenerator.ts   # 报告生成器
│   ├── EventAnalyst.ts      # 事件分析器
│   └── Date.ts              # 日期工具
├── types/                   # 📝 类型定义
│   └── gitlab.ts
├── constant/                # 📋 常量定义
│   └── activityType.ts
└── prompts/                 # 🤖 AI提示模板
    └── MonthlyReportSummary.ts
```

### 架构图

```mermaid
graph TB
    subgraph "用户接口层"
        A[Claude Desktop] --> B[MCP Protocol]
        C[npx命令行] --> B
    end

    subgraph "MCP服务器"
        B --> D[GitLabActivityTool]
        D --> E[Input Validation<br/>Zod Schema]
    end

    subgraph "业务处理层"
        E --> F[GitLabService]
        F --> G[CacheService]
        F --> H[EventAnalyst]
        H --> I[ReportGenerator]
    end

    subgraph "外部依赖"
        F --> J[GitLab API]
        G --> K[LowDB Cache]
        I --> L[Markdown Report]
    end

    subgraph "AI增强"
        I --> M[MonthlyReportSummary<br/>Prompt]
    end
```

## 🔧 核心模块

### 1. MCP工具层

| 模块                   | 职责        | 关键特性                                 |
| ---------------------- | ----------- | ---------------------------------------- |
| **GitLabActivityTool** | MCP工具入口 | • 参数验证<br/>• 错误处理<br/>• 报告生成 |

### 2. 服务层

| 模块              | 职责           | 关键特性                                      |
| ----------------- | -------------- | --------------------------------------------- |
| **GitLabService** | GitLab API交互 | • 认证管理<br/>• API错误处理<br/>• 超时控制   |
| **CacheService**  | 数据缓存       | • 项目信息缓存<br/>• LowDB存储<br/>• 性能优化 |

### 3. 数据处理层

| 模块                | 职责     | 关键特性                                         |
| ------------------- | -------- | ------------------------------------------------ |
| **EventAnalyst**    | 活动分析 | • 智能分类<br/>• 统计计算<br/>• 数据转换         |
| **ReportGenerator** | 报告生成 | • Markdown格式化<br/>• 多样式支持<br/>• 图表生成 |

## 🎛️ 环境配置

### 必需变量

| 变量名                | 描述              | 示例值                       |
| --------------------- | ----------------- | ---------------------------- |
| `GITLAB_BASE_URL`     | GitLab实例API地址 | `https://gitlab.com/api/v4`  |
| `GITLAB_ACCESS_TOKEN` | GitLab访问令牌    | `glpat-xxxxxxxxxxxxxxxxxxxx` |

### 可选变量

| 变量名              | 描述         | 默认值                      |
| ------------------- | ------------ | --------------------------- |
| `GITLAB_CACHE_PATH` | 缓存文件路径 | `./cache/gitlab-cache.json` |

## 🎨 功能特性

### 📊 智能活动分类

- 🐛 **Bug修复** - 自动识别修复相关关键词
- ✨ **新功能** - 识别功能开发关键词
- 🔧 **改进优化** - 识别重构和优化关键词
- 📚 **文档更新** - 识别文档相关关键词
- 🧪 **测试** - 识别测试相关关键词
- ⚙️ **配置更改** - 识别配置和CI相关关键词

### 📝 多样化报告格式

- **按项目分组**: 清晰展示各项目活动
- **按类型分组**: 统计各类活动数量
- **时间排序**: 活动按时间倒序展示
- **链接支持**: 直接跳转到GitLab查看详情

### 🚀 性能优化

- **智能缓存**: 项目信息本地缓存，减少API调用
- **超时控制**: 5秒超时保护，避免长时间等待
- **错误恢复**: 完善的错误处理和重试机制

## 🔗 详细文档

### 模块分析

- [🔌 MCP工具入口模块](../模块分析/GitLabActivityTool.md) ✅ - MCP协议实现与API入口
- [🌐 GitLab API服务模块](../模块分析/GitLabService.md) ✅ - GitLab API交互与认证管理
- [🧠 活动事件分析器模块](../模块分析/EventAnalyst.md) ✅ - 智能分类与数据转换
- [📝 报告生成器模块](../模块分析/ReportGenerator.md) ✅ - Markdown报告格式化
- [💾 数据缓存服务模块](../模块分析/CacheService.md) ✅ - LowDB持久化缓存

### 业务流程

> 📋 **说明**: 以下流程文档将在步骤3中生成

- [活动报告生成流程](../业务流程/ActivityReportGeneration.md) 📄
- [GitLab数据获取流程](../业务流程/GitLabDataFetching.md) 📄

## 🔄 最近更新

### 2025-12-03: Commits API 重构

- ✅ 重构数据获取逻辑，采用两阶段策略
- ✅ 新增完整的 Commits API 集成
- ✅ 支持跨分支查询和作者过滤
- ✅ 提升数据完整性，不再遗漏 commits

详见：[REFACTORING_COMMITS_API.md](../../REFACTORING_COMMITS_API.md)

---

_📅 文档生成时间: 2025年1月17日 | 最后更新: 2025年12月3日 | 🤖 由工作流自动生成_
