import { logger } from 'mcp-framework';
import { FilterResult, GitLabActivity, GitLabEvent } from '../types/gitlab';
import { gitLabService } from '../services/GitLabService.js';
import { ACTIVITY_TYPE_KEYWORDS, ActivityType } from '../constant/activityType.js';

export const transformCommitEventToActivity = async (commitEvents: GitLabEvent[]): Promise<GitLabActivity[]> => {
  const activities: GitLabActivity[] = [];

  for (const event of commitEvents) {
    try {
      const project = await gitLabService.getProject(event.project_id);
      const { commit_title, ref } = event.push_data || {};

      const title = commit_title || `Push to ${project.name}`;

      // 过滤掉无用的合并提交
      if (title.startsWith('Merge branch')) {
        logger.info(`[EventAnalyst] 过滤掉合并提交: ${title}`);
        continue;
      }

      activities.push({
        type: 'commit',
        id: event.id.toString(),
        title,
        description: `${event.action_name} ${project.name} ${ref}`,
        createdAt: new Date(event.created_at),
        projectName: project.name,
        projectId: project.id,
        webUrl: project.web_url,
        author: event.author.name,
        authorId: event.author.id,
        action: event.action_name,
      });
    } catch (error: unknown) {
      logger.error(`[EventAnalyst] 处理提交事件失败:${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return activities;
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
