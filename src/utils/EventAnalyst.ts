import { logger } from "mcp-framework";
import { FilterResult, GitLabActivity, GitLabEvent } from "../types/gitlab";
import { gitLabService } from "../services/GitLabService.js";
import { ACTIVITY_TYPE_KEYWORDS } from "../constant/activityType.js";

export const transformCommitEventToActivity = async (commitEvents: GitLabEvent[]): Promise<GitLabActivity[]> => {
    const activities: GitLabActivity[] = [];

    for (const event of commitEvents) {
        try {
            const project = await gitLabService.getProject(event.project_id);
            const { commit_title, ref } = event.push_data || {};
            activities.push({
                type: 'commit',
                id: event.id.toString(),
                title: commit_title || `Push to ${project.name}`,
                description: `${event.action_name} ${project.name} ${ref}`,
                createdAt: new Date(event.created_at),
                projectName: project.name,
                projectId: project.id,
                webUrl: project.web_url,
                author: event.author.name,
                authorId: event.author.id,
                action: event.action_name
            });
        } catch (error: unknown) {
            logger.error(`[EventAnalyst] 处理提交事件失败:${error instanceof Error ? error.message : String(error)}`);
        }
    }

    return activities;
}

export const analyzeActivities = async (activities: GitLabActivity[]): Promise<FilterResult> => {
    logger.info(`[EventAnalyst] 开始给活动分类...`);
}