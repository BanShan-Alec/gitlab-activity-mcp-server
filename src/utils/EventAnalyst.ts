import { logger } from 'mcp-framework';
import { FilterResult, GitLabActivity, GitLabCommit, GitLabEvent } from '../types/gitlab';
import { gitLabService } from '../services/GitLabService.js';
import { ACTIVITY_TYPE_KEYWORDS, ActivityType } from '../constant/activityType.js';

/**
 * 从用户事件中提取活跃的项目ID列表
 * @param events 用户事件列表
 * @returns 去重后的项目ID列表
 */
export const extractActiveProjectIds = (events: GitLabEvent[]): number[] => {
  const projectIds = new Set<number>();

  for (const event of events) {
    if (event.project_id) {
      projectIds.add(event.project_id);
    }
  }

  const uniqueIds = Array.from(projectIds);
  logger.info(`[EventAnalyst] 从 ${events.length} 个事件中提取到 ${uniqueIds.length} 个活跃项目`);

  return uniqueIds;
};

/**
 * 将 GitLab Commit 转换为 GitLabActivity
 * @param commits Commit 列表
 * @param projectId 项目ID
 * @returns Activity 列表
 */
export const transformCommitsToActivities = async (
  commits: GitLabCommit[],
  projectId: number
): Promise<GitLabActivity[]> => {
  const activities: GitLabActivity[] = [];

  try {
    const project = await gitLabService.getProject(projectId);

    for (const commit of commits) {
      // 过滤掉无用的合并提交
      if (commit.title.startsWith('Merge branch')) {
        logger.debug(`[EventAnalyst] 过滤掉合并提交: ${commit.title}`);
        continue;
      }

      activities.push({
        type: 'commit',
        id: commit.id,
        title: commit.title,
        description: commit.message,
        createdAt: new Date(commit.committed_date),
        projectName: project.name,
        projectId: project.id,
        webUrl: commit.web_url,
        author: commit.author_name,
        authorId: 0, // Commit API 不返回 author_id，设为 0
        action: 'committed',
      });
    }

    logger.info(`[EventAnalyst] 项目 ${project.name} 转换了 ${activities.length} 个 commits`);
  } catch (error: unknown) {
    logger.error(
      `[EventAnalyst] 处理项目 ${projectId} 的 commits 失败: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return activities;
};

/**
 * 获取用户在指定时间范围内的完整 commits
 * @param userId 用户ID
 * @param userName 用户名（用于过滤 commits）
 * @param startDate 开始日期 (YYYY-MM-DD)
 * @param endDate 结束日期 (YYYY-MM-DD)
 * @returns Activity 列表
 */
export const getUserCommitsFromProjects = async (
  userId: string | number,
  userName: string,
  startDate: string,
  endDate: string
): Promise<GitLabActivity[]> => {
  logger.info(`[EventAnalyst] 开始获取用户 ${userName} 的完整 commits (${startDate} 至 ${endDate})`);

  try {
    // 1. 先从 getUserEvents 获取活跃的项目列表
    const events = await gitLabService.getUserEvents(userId, startDate, endDate);
    const projectIds = extractActiveProjectIds(events);

    if (projectIds.length === 0) {
      logger.info(`[EventAnalyst] 未发现活跃项目`);
      return [];
    }

    // 2. 对每个项目获取完整的 commits
    const allActivities: GitLabActivity[] = [];

    for (const projectId of projectIds) {
      try {
        logger.info(`[EventAnalyst] 获取项目 ${projectId} 的 commits...`);

        // 将日期转换为 ISO 8601 格式
        const sinceISO = `${startDate}T00:00:00Z`;
        const untilISO = `${endDate}T23:59:59Z`;

        const commits = await gitLabService.getProjectCommits(projectId, {
          author: userName, // 使用用户名过滤
          since: sinceISO,
          until: untilISO,
          all: true, // 获取所有分支的 commits
          perPage: 100,
        });

        const activities = await transformCommitsToActivities(commits, projectId);
        allActivities.push(...activities);
      } catch (error: unknown) {
        logger.error(
          `[EventAnalyst] 获取项目 ${projectId} 的 commits 失败: ${error instanceof Error ? error.message : String(error)}`
        );
        // 继续处理下一个项目
      }
    }

    logger.info(`[EventAnalyst] 共获取到 ${allActivities.length} 个 commits`);
    return allActivities;
  } catch (error: unknown) {
    logger.error(`[EventAnalyst] 获取用户 commits 失败: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

// 关键词匹配辅助函数
const matchKeywords = (text: string, keywords: string[]): string[] => {
  const lowerText = text.toLowerCase();
  return keywords.filter((keyword) => lowerText.includes(keyword.toLowerCase()));
};

// 单个活动分类逻辑
const classifyActivity = (activity: GitLabActivity): { type: ActivityType | null; matchedKeywords: string[] } => {
  const textToAnalyze = `${activity.title} ${activity.description || ''}`;

  // 按优先级顺序检查类型
  const typeOrder: ActivityType[] = ['bug_fix', 'feature', 'improvement', 'documentation', 'test', 'config'];

  for (const type of typeOrder) {
    const matchedKeywords = matchKeywords(textToAnalyze, ACTIVITY_TYPE_KEYWORDS[type].keywords);
    if (matchedKeywords.length > 0) {
      return { type, matchedKeywords };
    }
  }

  return { type: null, matchedKeywords: [] };
};

export const analyzeActivities = async (activities: GitLabActivity[]): Promise<FilterResult> => {
  logger.info(`[EventAnalyst] 开始给活动分类...`);

  const classifiedActivities: GitLabActivity[] = [];
  const matchReasons = new Map<string, string[]>();
  const typeStats: Record<ActivityType, number> = {
    bug_fix: 0,
    feature: 0,
    improvement: 0,
    documentation: 0,
    test: 0,
    config: 0,
    other: 0,
  };
  const projectStats: Record<string, number> = {};

  try {
    for (const activity of activities) {
      const { type, matchedKeywords } = classifyActivity(activity);

      if (type) {
        // 更新活动类型（扩展activity对象以包含分类信息）
        const classifiedActivity = { ...activity, activityType: type };
        classifiedActivities.push(classifiedActivity);

        // 记录匹配原因
        const reasons = matchedKeywords.map(
          (keyword) => `匹配关键词: "${keyword}" (${ACTIVITY_TYPE_KEYWORDS[type].description})`
        );
        matchReasons.set(activity.id, reasons);

        // 统计信息
        typeStats[type]++;
        projectStats[activity.projectName] = (projectStats[activity.projectName] || 0) + 1;
      } else {
        // 未分类的活动，归为other类型
        const defaultActivity = { ...activity, activityType: 'other' as ActivityType };
        classifiedActivities.push(defaultActivity);
        matchReasons.set(activity.id, ['未匹配到特定关键词，归类为其他']);
        typeStats.other++;
        projectStats[activity.projectName] = (projectStats[activity.projectName] || 0) + 1;
      }
    }

    logger.info(`[EventAnalyst] 分类完成，共处理 ${activities.length} 个活动`);

    return {
      activities: classifiedActivities,
      matchReasons,
      statistics: {
        total: activities.length,
        byType: typeStats,
        byProject: projectStats,
      },
    };
  } catch (error: unknown) {
    logger.error(`[EventAnalyst] 活动分类失败: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};
