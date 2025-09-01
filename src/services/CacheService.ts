import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

import { logger } from 'mcp-framework';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

interface CacheData {
  users: Record<string, { data: any; timestamp: number }>;
  projects: Record<string, { data: any; timestamp: number }>;
  accessToken?: string; // 记录当前使用的 access token
}

/**
 * 缓存服务，用于缓存 GitLab API 响应数据
 */
class CacheService {
  private db: Low<CacheData>;
  private cacheDuration: number; // 缓存持续时间（毫秒）
  private currentAccessToken: string;

  constructor(cachePath?: string, cacheDurationHours: number = 24) {
    const defaultPath = join(process.cwd(), 'cache', 'gitlab-cache.json');
    const dbPath = cachePath || process.env.GITLAB_CACHE_PATH || defaultPath;
    // 创建 cache 目录&文件
    const cacheDir = join(process.cwd(), 'cache');
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir);
    }
    if (!existsSync(dbPath)) {
      writeFileSync(dbPath, '{}');
    }

    // 创建数据库适配器
    const adapter = new JSONFile<CacheData>(dbPath);
    this.db = new Low(adapter, { users: {}, projects: {} });

    this.cacheDuration = cacheDurationHours * 60 * 60 * 1000; // 转换为毫秒
    this.currentAccessToken = process.env.GITLAB_ACCESS_TOKEN || '';

    // 初始化数据库
    logger.info(`[CacheService] 初始化数据库 ${dbPath}`);
    this.initializeDatabase();
  }

  /**
   * 初始化数据库
   */
  private async initializeDatabase(): Promise<void> {
    try {
      await this.db.read();

      // 如果数据库为空，设置默认数据
      if (!this.db.data) {
        this.db.data = { users: {}, projects: {}, accessToken: this.currentAccessToken };
        await this.db.write();
      } else {
        // 检查 access token 是否变化，如果变化则清空缓存
        await this.checkAndClearCacheOnTokenChange();
      }
    } catch (error) {
      logger.warn(`Cache database initialization warning: ${String(error)}`);
      // 如果读取失败，创建默认数据
      this.db.data = { users: {}, projects: {}, accessToken: this.currentAccessToken };
    }
  }

  /**
   * 检查 access token 是否变化，如果变化则清空缓存
   */
  private async checkAndClearCacheOnTokenChange(): Promise<void> {
    try {
      if (this.db.data?.accessToken && this.db.data.accessToken !== this.currentAccessToken) {
        logger.info(
          `Access token changed, clearing all cache, oldAccessToken: ${this.db.data.accessToken}, currentAccessToken: ${this.currentAccessToken}`
        );
        this.db.data = { users: {}, projects: {}, accessToken: this.currentAccessToken };
        await this.db.write();
      } else if (!this.db.data?.accessToken) {
        // 如果没有记录 access token，更新它
        if (this.db.data) {
          this.db.data.accessToken = this.currentAccessToken;
          await this.db.write();
        }
      }
    } catch (error) {
      logger.warn(`Failed to check access token change: ${String(error)}`);
    }
  }

  /**
   * 检查缓存是否有效
   */
  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheDuration;
  }

  /**
   * 获取用户缓存
   */
  async getUser(userId: string): Promise<any | null> {
    try {
      await this.db.read();
      const userCache = this.db.data?.users[userId];

      if (userCache && this.isValidCache(userCache.timestamp)) {
        logger.info(`Cache hit for user: ${userId}`);
        return userCache.data;
      }

      return null;
    } catch (error) {
      logger.warn(`Failed to read user cache: ${String(error)}`);
      return null;
    }
  }

  /**
   * 设置用户缓存
   */
  async setUser(userId: string, data: any): Promise<void> {
    try {
      await this.db.read();

      if (!this.db.data) {
        this.db.data = { users: {}, projects: {} };
      }

      this.db.data.users[userId] = {
        data,
        timestamp: Date.now(),
      };

      await this.db.write();
      logger.info(`Cache set for user: ${userId}`);
    } catch (error) {
      logger.warn(`Failed to write user cache: ${String(error)}`);
    }
  }

  /**
   * 获取项目缓存
   */
  async getProject(projectId: string): Promise<any | null> {
    try {
      await this.db.read();
      const projectCache = this.db.data?.projects[projectId];

      if (projectCache && this.isValidCache(projectCache.timestamp)) {
        logger.info(`Cache hit for project: ${projectId}`);
        return projectCache.data;
      }

      return null;
    } catch (error) {
      logger.warn(`Failed to read project cache: ${String(error)}`);
      return null;
    }
  }

  /**
   * 设置项目缓存
   */
  async setProject(projectId: string, data: any): Promise<void> {
    try {
      await this.db.read();

      if (!this.db.data) {
        this.db.data = { users: {}, projects: {} };
      }

      this.db.data.projects[projectId] = {
        data,
        timestamp: Date.now(),
      };

      await this.db.write();
      logger.info(`Cache set for project: ${projectId}`);
    } catch (error) {
      logger.warn(`Failed to write project cache: ${String(error)}`);
    }
  }

  /**
   * 清除过期缓存
   */
  async clearExpiredCache(): Promise<void> {
    try {
      await this.db.read();

      if (!this.db.data) return;

      const now = Date.now();
      let hasChanges = false;

      // 清除过期用户缓存
      for (const [userId, userCache] of Object.entries(this.db.data.users)) {
        if (!this.isValidCache(userCache.timestamp)) {
          delete this.db.data.users[userId];
          hasChanges = true;
        }
      }

      // 清除过期项目缓存
      for (const [projectId, projectCache] of Object.entries(this.db.data.projects)) {
        if (!this.isValidCache(projectCache.timestamp)) {
          delete this.db.data.projects[projectId];
          hasChanges = true;
        }
      }

      if (hasChanges) {
        await this.db.write();
        logger.info('Expired cache entries cleared');
      }
    } catch (error) {
      logger.warn(`Failed to clear expired cache: ${String(error)}`);
    }
  }

  /**
   * 清除所有缓存
   */
  async clearAllCache(): Promise<void> {
    try {
      this.db.data = { users: {}, projects: {}, accessToken: this.currentAccessToken };
      await this.db.write();
      logger.info('All cache cleared');
    } catch (error) {
      logger.warn(`Failed to clear all cache: ${String(error)}`);
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getCacheStats(): Promise<{ userCount: number; projectCount: number }> {
    try {
      await this.db.read();

      if (!this.db.data) {
        return { userCount: 0, projectCount: 0 };
      }

      return {
        userCount: Object.keys(this.db.data.users).length,
        projectCount: Object.keys(this.db.data.projects).length,
      };
    } catch (error) {
      logger.warn(`Failed to get cache stats: ${String(error)}`);
      return { userCount: 0, projectCount: 0 };
    }
  }
}

export const cacheService = new CacheService();
