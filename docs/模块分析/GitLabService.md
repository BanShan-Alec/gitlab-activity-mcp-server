# GitLab API 服务模块

> **文件路径**: `src/services/GitLabService.ts`  
> **模块类型**: 核心业务服务层  
> **依赖关系**: CacheService, gitlab类型定义

## 📋 模块概述

**GitLabService** 是项目的核心API交互服务，负责与GitLab实例进行通信，获取用户活动数据和项目信息。该模块实现了完整的认证、错误处理和缓存集成机制。

### 核心职责
- 🔐 **认证管理**: 处理GitLab Access Token验证和配置
- 🌐 **API交互**: 封装GitLab REST API调用
- ⚡ **性能优化**: 集成缓存服务减少API调用
- 🛡️ **错误处理**: 完善的HTTP错误处理和用户友好提示
- ⏰ **超时控制**: 5秒超时保护机制

## 🏗️ 技术架构

### 设计模式
- **单例模式**: 通过`gitLabService`导出全局实例
- **适配器模式**: 封装原生fetch API为业务友好的接口
- **策略模式**: 不同HTTP状态码的错误处理策略

### 依赖关系图
```mermaid
graph TB
    A[GitLabService] --> B[CacheService]
    A --> C[GitLab API]
    A --> D[GitlabUser]
    A --> E[GitLabEvent]
    
    B --> F[LowDB]
    C --> G[HTTP Client]
    
    subgraph "数据流"
        H[配置验证] --> I[API请求] 
        I --> J[缓存检查]
        J --> K[响应处理]
    end
```

## 🔧 核心功能

### 1. 配置验证与初始化
```typescript
constructor() {
  this.baseUrl = process.env.GITLAB_BASE_URL || '';
  this.accessToken = process.env.GITLAB_ACCESS_TOKEN || '';
  logger.info(`[GitLabAuthService] 初始化 GitLabAuthService ${this.baseUrl}`);
}
```

**特性**:
- 环境变量自动读取
- 启动时配置完整性验证
- 详细的配置错误提示

### 2. 统一API请求处理
```typescript
async fetchGitLab(endpoint: string, options: RequestInit = {}): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  const response = await fetch(url, {
    method: 'GET',
    signal: controller.signal,
    headers: {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}
```

**特性**:
- 统一的认证头处理
- 5秒超时保护
- AbortController信号控制
- 可扩展的请求选项

### 3. 智能错误处理
```typescript
private handleApiError(response: Response): never {
  switch (response.status) {
    case 401: // 认证失败
    case 403: // 权限不足
    case 404: // 资源不存在
    case 429: // 速率限制
    case 500: // 服务器错误
  }
}
```

**错误映射表**:
| HTTP状态 | 错误类型 | 用户提示 |
|----------|----------|----------|
| 401 | 认证失败 | 访问令牌无效或已过期 |
| 403 | 权限不足 | 令牌缺少read_user权限 |
| 404 | 资源不存在 | 用户或资源不存在 |
| 429 | 速率限制 | 请求过于频繁，稍后重试 |
| 5xx | 服务器错误 | GitLab服务暂时不可用 |

## 📊 API接口设计

### 用户事件获取
```typescript
async getUserEvents(userId: string | number, after?: string, before?: string): Promise<GitLabEvent[]>
```

**参数**:
- `userId`: 用户ID
- `after`: 开始日期(可选)
- `before`: 结束日期(可选)

**返回**: GitLab事件数组

**用途**: 主要用于获取用户活跃的项目列表

### 项目 Commits 获取 (新增)
```typescript
async getProjectCommits(
  projectId: number,
  options: {
    author?: string;      // 作者名称
    since?: string;       // 开始日期 ISO 8601 格式
    until?: string;       // 结束日期 ISO 8601 格式
    refName?: string;     // 分支名称
    perPage?: number;     // 每页数量，默认 100
    all?: boolean;        // 是否获取所有分支，默认 false
  }
): Promise<GitLabCommit[]>
```

**参数**:
- `projectId`: 项目ID
- `author`: 按作者名称过滤（精确匹配）
- `since`: 开始时间，格式 `YYYY-MM-DDTHH:MM:SSZ`
- `until`: 结束时间，格式 `YYYY-MM-DDTHH:MM:SSZ`
- `all`: 设为 `true` 时获取所有分支的 commits
- `perPage`: 每页返回数量，最大 100

**返回**: GitLab Commit 数组

**特性**:
- 获取完整的 commit 历史记录
- 支持跨所有分支查询
- 按作者精确过滤
- 失败时返回空数组，不中断流程

**API 端点**: `GET /projects/:id/repository/commits`

### 当前用户信息
```typescript
async getCurrentUser(): Promise<GitlabUser>
```

**特性**:
- 内存缓存用户信息
- 避免重复API调用

### 项目信息获取
```typescript
async getProject(projectId: number): Promise<Project>
```

**特性**:
- 集成CacheService缓存
- 自动缓存管理
- 24小时缓存有效期

## ⚡ 性能优化策略

### 1. 多层缓存机制
- **内存缓存**: 当前用户信息
- **持久缓存**: 项目信息(LowDB)
- **缓存失效**: Access Token变更自动清空

### 2. 网络优化
- **超时控制**: 5秒超时防止长等待
- **并发限制**: 单实例模式避免重复连接
- **错误重试**: 基于HTTP状态的智能处理

## 🔍 使用示例

```typescript
// 1. 获取当前用户
const user = await gitLabService.getCurrentUser();

// 2. 获取用户活动事件（用于提取活跃项目）
const events = await gitLabService.getUserEvents(
  user.id, 
  '2025-01-01', 
  '2025-01-31'
);

// 3. 获取项目的完整 commits
const commits = await gitLabService.getProjectCommits(123, {
  author: user.name,
  since: '2025-01-01T00:00:00Z',
  until: '2025-01-31T23:59:59Z',
  all: true,
  perPage: 100
});

// 4. 获取项目详情
const project = await gitLabService.getProject(123);
```

## 🛡️ 错误处理最佳实践

### 配置错误
```typescript
// 详细的配置指导
throw new Error(`GitLab 配置缺失。请在 MCP 配置中设置以下环境变量：
- GITLAB_BASE_URL: GitLab 实例的 API 基础 URL
- GITLAB_ACCESS_TOKEN: GitLab 访问令牌 (需要 read_user 或 api 权限)

配置示例：
{
  "mcpServers": {
    "gitlab-activity": {
      "env": {
        "GITLAB_BASE_URL": "https://gitlab.com/api/v4",
        "GITLAB_ACCESS_TOKEN": "glpat-xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}`);
```

### 网络错误
- **超时处理**: AbortError → "GitLab API 请求超时"
- **网络异常**: TypeError → "网络错误：无法连接到GitLab实例"
- **API异常**: 基于状态码的具体错误信息

## 📈 监控与日志

### 关键日志节点
1. **初始化**: 服务启动和配置验证
2. **API调用**: 请求URL和参数
3. **缓存操作**: 缓存命中/未命中
4. **错误处理**: 详细错误信息和堆栈跟踪

### 性能指标
- API响应时间
- 缓存命中率
- 错误率统计
- 超时发生频率

## 🔄 重构历史

### 2025-12-03: Commits API 集成
- ✅ 新增 `getProjectCommits()` 方法
- ✅ 支持完整的 commit 历史获取
- ✅ 支持跨分支查询和作者过滤
- ✅ 优化错误处理，失败不中断流程

详见：[REFACTORING_COMMITS_API.md](../../REFACTORING_COMMITS_API.md)

---

*📅 最后更新: 2025年12月3日 | 🔄 状态: 生产就绪*

