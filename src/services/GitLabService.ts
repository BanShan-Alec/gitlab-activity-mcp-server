import { GitLabCommit, GitLabEvent, GitLabProject, GitlabUser } from '../types/gitlab.js';
import { logger } from 'mcp-framework';
import { cacheService } from './CacheService.js';

export class GitLabService {
  private baseUrl: string;
  private accessToken: string;
  private user?: GitlabUser;

  constructor() {
    // 从环境变量获取配置
    this.baseUrl = process.env.GITLAB_BASE_URL || '';
    this.accessToken = process.env.GITLAB_ACCESS_TOKEN || '';

    logger.info(`[GitLabAuthService] 初始化 GitLabAuthService ${this.baseUrl}`);
  }

  /**
   * 验证配置是否完整
   */
  async validateConfig(): Promise<void> {
    if (!this.baseUrl || !this.accessToken) {
      throw new Error(`GitLab 配置缺失。请在 MCP 配置中设置以下环境变量：
    - GITLAB_BASE_URL: GitLab 实例的 API 基础 URL (例如: https://gitlab.com/api/v4)
    - GITLAB_ACCESS_TOKEN: GitLab 访问令牌 (需要 read_user 或 api 权限)
    
    配置示例：
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
    }`);
    }

    try {
      this.user = await this.getCurrentUser();
      logger.info(`[GitLabService] 验证配置成功 ${JSON.stringify(this.user)}`);
    } catch (error: unknown) {
      throw new Error(`GitLab 配置错误。请检查在 MCP 配置中设置以下的环境变量：
    - GITLAB_BASE_URL: GitLab 实例的 API 基础 URL (例如: https://gitlab.com/api/v4)
    - GITLAB_ACCESS_TOKEN: GitLab 访问令牌 (需要 read_user 或 api 权限) 
    - ${error}`);
    }
  }

  /**
   * 执行认证的 GitLab API 请求
   */
  async fetchGitLab(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    logger.info(`[GitLabService] 执行 GitLab API 请求 ${url} ${JSON.stringify(options)}`);

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response: Response = await fetch(url, {
        method: 'GET',
        ...options,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        this.handleApiError(response);
      }

      return response.json();
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('GitLab API 请求超时');
        }
        if (error.name === 'TypeError') {
          throw new Error('网络错误：无法连接到 GitLab 实例');
        }
      }
      throw error;
    }
  }

  /**
   * 处理 API 错误
   */
  private handleApiError(response: Response): never {
    switch (response.status) {
      case 401:
        throw new Error(
          `认证失败：访问令牌无效或已过期。请检查您的 GitLab 访问令牌是否有效且具有 read_user 或 api 权限。`
        );
      case 403:
        throw new Error(`权限不足：您的访问令牌没有足够的权限访问用户事件。请确保令牌具有 read_user 或 api 权限。`);
      case 404:
        throw new Error(`资源不存在：当前用户或请求的资源不存在。请检查访问令牌是否有效，GitLab 实例是否正确。`);
      case 429:
        throw new Error(`请求过于频繁：已达到 GitLab API 速率限制，请稍后重试。`);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new Error(`GitLab 服务器错误 (${response.status})：服务器暂时不可用，请稍后重试。`);
      default:
        throw new Error(`GitLab API 错误 (${response.status}): ${response.statusText}`);
    }
  }

  /**
   * 获取用户事件
   * @param userId 用户ID
   * @param after 开始日期
   * @param before 结束日期
   * @returns 事件列表
   */
  async getUserEvents(userId: string | number, after?: string, before?: string): Promise<GitLabEvent[]> {
    const params = new URLSearchParams({
      action: 'pushed',
      after: after || '',
      before: before || '',
      per_page: '500',
    });

    const endpoint = `/users/${userId}/events?${params.toString()}`;

    return this.fetchGitLab(endpoint);
  }

  /**
   * 获取当前用户信息
   * @returns 当前用户信息
   */
  async getCurrentUser(): Promise<GitlabUser> {
    if (this.user) return this.user;
    const user = (await this.fetchGitLab('/user')) as GitlabUser;

    return user;
  }

  /**
   * 获取项目信息
   * @param projectId 项目ID
   * @returns 项目信息
   */
  async getProject(projectId: number): Promise<GitLabProject> {
    const cacheKey = projectId.toString();

    // 尝试从缓存获取
    const cachedProject = await cacheService.getProject(cacheKey);
    if (cachedProject) {
      return cachedProject as GitLabProject;
    }

    // 从 API 获取并缓存
    const project = (await this.fetchGitLab(`/projects/${projectId}`)) as GitLabProject;
    await cacheService.setProject(cacheKey, project);

    return project;
  }

  /**
   * 获取项目的 commit 列表
   * @param projectId 项目ID
   * @param options 查询选项
   * @returns Commit 列表
   */
  async getProjectCommits(
    projectId: number,
    options: {
      author?: string; // 作者名称
      since?: string; // 开始日期 ISO 8601 格式
      until?: string; // 结束日期 ISO 8601 格式
      refName?: string; // 分支名称，默认为 default branch
      perPage?: number; // 每页数量，默认 100
      all?: boolean; // 是否获取所有分支，默认 false
    } = {}
  ): Promise<GitLabCommit[]> {
    const { author, since, until, refName, perPage = 100, all = false } = options;

    const params = new URLSearchParams({
      per_page: perPage.toString(),
    });

    if (author) params.append('author', author);
    if (since) params.append('since', since);
    if (until) params.append('until', until);
    if (refName) params.append('ref_name', refName);
    if (all) params.append('all', 'true');

    const endpoint = `/projects/${projectId}/repository/commits?${params.toString()}`;
    logger.info(`[GitLabService] 获取项目 ${projectId} 的 commits`);

    try {
      const commits = await this.fetchGitLab(endpoint);
      logger.info(`[GitLabService] 成功获取项目 ${projectId} 的 ${commits.length} 个 commits`);
      return commits;
    } catch (error: unknown) {
      logger.error(
        `[GitLabService] 获取项目 ${projectId} 的 commits 失败: ${error instanceof Error ? error.message : String(error)}`
      );
      // 如果获取失败（比如项目没有仓库），返回空数组而不是抛出错误
      return [];
    }
  }
}

export const gitLabService = new GitLabService();
gitLabService.validateConfig();
