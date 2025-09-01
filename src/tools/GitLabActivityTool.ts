import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { formatActivitiesMarkdown, generateActivitySummary } from "../utils/ReportGenerator.js";
import { GitLabService } from "../services/GitLabService.js";
import { analyzeActivities, transformCommitEventToActivity } from "../utils/EventAnalyst.js";

interface GitLabActivitySchema {
    startDate: string;
    endDate: string;
}

class GitLabActivityTool extends MCPTool<GitLabActivitySchema> {
    name = "gitlab_activity_report";
    description = "获取当前用户的 GitLab 活动记录并生成 Markdown 报告";
    schema = {
        startDate: {
            type: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必须为 YYYY-MM-DD (例如: 2025-01-01)"),
            description: "开始日期 (ISO 8601 格式，例如: 2025-01-01)",
            required: true
        },
        endDate: {
            type: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必须为 YYYY-MM-DD (例如: 2025-01-31)"),
            description: "结束日期 (ISO 8601 格式，例如: 2025-01-31)",
            required: false
        }
    };

    async execute(input: GitLabActivitySchema) {
        try {
            const { startDate, endDate } = input;
            logger.info(`[GitLabActivityTool] 执行工具 ${JSON.stringify(input)}`);

            // 获取服务单例
            const gitlabService = new GitLabService();

            // 获取当前用户信息
            const currentUser = await gitlabService.getCurrentUser();
            const targetUserId = currentUser.id;
            logger.info(`[gitlabService] 获取当前用户信息 ${targetUserId}`);

            // 获取用户事件
            const events = await gitlabService.getUserEvents(targetUserId, startDate, endDate);
            logger.info(`[gitlabService] 获取用户事件 ${events.length} 条`);

            if (events.length === 0) {
                return `📭 在指定时间范围内未找到活动记录。
    
    **查询参数：**
    - 用户：${currentUser.username} (${targetUserId})
    - 开始日期：${startDate || '未指定'}
    - 结束日期：${endDate || '未指定'}
    
    请检查：
    1. 时间范围内是否有 GitLab 活动
    2. 访问令牌是否有足够权限`;
            }

            // 分析活动数据
            const activities = await transformCommitEventToActivity(events);
            const res = await analyzeActivities(
                activities
            );

            // 生成详细报告
            return formatActivitiesMarkdown(res, {
                start: new Date(startDate),
                end: new Date(endDate)
            });
        } catch (error) {
            logger.error(`[GitLabActivityTool] 执行工具失败: ${error}`);
            return `❌ 执行工具失败: ${error}`;
        }
    }
}

export default GitLabActivityTool;
