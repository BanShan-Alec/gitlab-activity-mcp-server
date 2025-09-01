/**
 * Markdown格式化器
 * 生成包含链接和时间的GitLab活动报告
 */

import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { GitLabActivity, FilterResult } from '../types/gitlab.js';

export interface FormatOptions {
    // 是否显示统计信息
    showStatistics?: boolean;
    // 是否按项目分组
    groupByProject?: boolean;
    // 是否按活动类型分组
    groupByType?: boolean;
    // 是否显示匹配原因
    showMatchReasons?: boolean;
    // 是否显示详细时间
    showDetailedTime?: boolean;
    // 是否限制描述长度
    maxDescriptionLength?: number;
    // 标题
    title?: string;
    // 时间范围描述
    timeRangeDescription?: string;
}

interface DateRange {
    start: Date;
    end: Date;
}

export class MarkdownFormatter {
    /**
     * 格式化GitLab活动为Markdown报告
     */
    formatActivities(
        filterResult: FilterResult,
        timeRange: DateRange,
        options: FormatOptions = {}
    ): string {
        const {
            showStatistics = true,
            groupByProject = true,
            groupByType = false,
            showMatchReasons = false,
            showDetailedTime = true,
            maxDescriptionLength = 200,
            title = 'GitLab活动报告',
            timeRangeDescription
        } = options;

        const { activities, matchReasons, statistics } = filterResult;
        const sections: string[] = [];

        // 1. 标题和时间范围
        sections.push(this.formatHeader(title, timeRange, timeRangeDescription));

        // 2. 统计信息
        if (showStatistics && activities.length > 0) {
            sections.push(this.formatStatistics(statistics));
        }

        // 3. 活动详情
        if (activities.length > 0) {
            if (groupByProject) {
                sections.push(this.formatActivitiesByProject(activities, matchReasons, {
                    showMatchReasons,
                    showDetailedTime,
                    maxDescriptionLength
                }));
            } else if (groupByType) {
                sections.push(this.formatActivitiesByType(activities, matchReasons, {
                    showMatchReasons,
                    showDetailedTime,
                    maxDescriptionLength
                }));
            } else {
                sections.push(this.formatActivitiesList(activities, matchReasons, {
                    showMatchReasons,
                    showDetailedTime,
                    maxDescriptionLength
                }));
            }
        } else {
            sections.push('## 📝 活动详情\n\n*在指定的时间范围内没有找到匹配的活动。*');
        }

        // 4. 脚注
        sections.push(this.formatFooter());

        return sections.join('\n\n');
    }

    /**
     * 格式化报告头部
     */
    private formatHeader(title: string, timeRange: DateRange, customDescription?: string): string {
        const timeDesc = customDescription || this.formatTimeRange(timeRange);

        return `# ${title}\n\n**时间范围**: ${timeDesc}\n**生成时间**: ${format(new Date(), 'yyyy年MM月dd日 HH:mm:ss', { locale: zhCN })}`;
    }

    /**
     * 格式化统计信息
     */
    private formatStatistics(statistics: FilterResult['statistics']): string {
        const sections = ['## 📊 统计信息'];

        sections.push(`**总计**: ${statistics.total} 个活动`);

        // 按GitLab类型统计
        if (Object.keys(statistics.byType).length > 0) {
            sections.push('### 📋 按类型分布');
            const typeItems = Object.entries(statistics.byType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => `- **${this.getTypeDisplayName(type)}**: ${count} 个`)
                .join('\n');
            sections.push(typeItems);
        }

        // 按项目统计
        if (Object.keys(statistics.byProject).length > 0) {
            sections.push('### 🏗️ 按项目分布');
            const projectItems = Object.entries(statistics.byProject)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10) // 只显示前10个项目
                .map(([project, count]) => `- **${project}**: ${count} 个`)
                .join('\n');
            sections.push(projectItems);
        }

        return sections.join('\n\n');
    }

    /**
     * 按项目分组格式化活动
     */
    private formatActivitiesByProject(
        activities: GitLabActivity[],
        matchReasons: Map<string, string[]>,
        options: { showMatchReasons: boolean; showDetailedTime: boolean; maxDescriptionLength: number }
    ): string {
        const sections = ['## 📝 活动详情'];

        // 按项目分组
        const byProject = this.groupByField(activities, 'projectName');

        for (const [projectName, projectActivities] of Object.entries(byProject)) {
            sections.push(`### 🏗️ ${projectName} (${projectActivities.length} 个活动)`);

            // 按时间排序
            const sortedActivities = projectActivities.sort((a, b) =>
                b.createdAt.getTime() - a.createdAt.getTime()
            );

            for (const activity of sortedActivities) {
                sections.push(this.formatSingleActivity(activity, matchReasons.get(activity.id) || [], options));
            }
        }

        return sections.join('\n\n');
    }

    /**
     * 按类型分组格式化活动
     */
    private formatActivitiesByType(
        activities: GitLabActivity[],
        matchReasons: Map<string, string[]>,
        options: { showMatchReasons: boolean; showDetailedTime: boolean; maxDescriptionLength: number }
    ): string {
        const sections = ['## 📝 活动详情'];

        // 按GitLab类型分组
        const byType = this.groupByField(activities, 'type');

        for (const [type, typeActivities] of Object.entries(byType)) {
            sections.push(`### ${this.getTypeIcon(type)} ${this.getTypeDisplayName(type)} (${typeActivities.length} 个)`);

            // 按时间排序
            const sortedActivities = typeActivities.sort((a, b) =>
                b.createdAt.getTime() - a.createdAt.getTime()
            );

            for (const activity of sortedActivities) {
                sections.push(this.formatSingleActivity(activity, matchReasons.get(activity.id) || [], options));
            }
        }

        return sections.join('\n\n');
    }

    /**
     * 列表格式化活动
     */
    private formatActivitiesList(
        activities: GitLabActivity[],
        matchReasons: Map<string, string[]>,
        options: { showMatchReasons: boolean; showDetailedTime: boolean; maxDescriptionLength: number }
    ): string {
        const sections = ['## 📝 活动详情'];

        // 按时间排序
        const sortedActivities = activities.sort((a, b) =>
            b.createdAt.getTime() - a.createdAt.getTime()
        );

        for (const activity of sortedActivities) {
            sections.push(this.formatSingleActivity(activity, matchReasons.get(activity.id) || [], options));
        }

        return sections.join('\n\n');
    }

    /**
     * 格式化单个活动
     */
    private formatSingleActivity(
        activity: GitLabActivity,
        reasons: string[],
        options: { showMatchReasons: boolean; showDetailedTime: boolean; maxDescriptionLength: number }
    ): string {
        const { showMatchReasons, showDetailedTime, maxDescriptionLength } = options;

        const sections: string[] = [];

        // 标题行
        const typeIcon = this.getTypeIcon(activity.type);
        const title = `#### ${typeIcon} ${activity.title}`;
        sections.push(title);

        // 基本信息
        const info: string[] = [];
        info.push(`**项目**: ${activity.projectName}`);
        info.push(`**类型**: ${this.getTypeDisplayName(activity.type)}`);
        info.push(`**作者**: ${activity.author}`);

        if (showDetailedTime) {
            info.push(`**创建时间**: ${format(activity.createdAt, 'yyyy年MM月dd日 HH:mm:ss', { locale: zhCN })}`);
            if (activity.updatedAt && activity.updatedAt.getTime() !== activity.createdAt.getTime()) {
                info.push(`**更新时间**: ${format(activity.updatedAt, 'yyyy年MM月dd日 HH:mm:ss', { locale: zhCN })}`);
            }
        } else {
            info.push(`**时间**: ${format(activity.createdAt, 'MM月dd日 HH:mm', { locale: zhCN })}`);
        }

        if (activity.state) {
            info.push(`**状态**: ${this.formatState(activity.state)}`);
        }

        sections.push(info.join(' | '));

        // 描述
        if (activity.description) {
            let description = activity.description.trim();
            if (description.length > maxDescriptionLength) {
                description = description.substring(0, maxDescriptionLength) + '...';
            }
            sections.push(`**描述**: ${description}`);
        }

        // 标签
        if (activity.labels && activity.labels.length > 0) {
            const labelText = activity.labels.map(label => `\`${label}\``).join(' ');
            sections.push(`**标签**: ${labelText}`);
        }

        // 链接
        sections.push(`**链接**: [查看详情](${activity.webUrl})`);

        // 匹配原因
        if (showMatchReasons && reasons.length > 0) {
            const reasonText = reasons.map(reason => `- ${reason}`).join('\n');
            sections.push(`**匹配原因**:\n${reasonText}`);
        }

        return sections.join('\n\n');
    }

    /**
     * 格式化脚注
     */
    private formatFooter(): string {
        return `---\n\n*本报告由 GitLab Activity MCP 自动生成*`;
    }

    /**
     * 格式化时间范围
     */
    private formatTimeRange(timeRange: DateRange): string {
        const { start, end } = timeRange;

        if (this.isSameDay(start, end)) {
            return format(start, 'yyyy年MM月dd日 (E)', { locale: zhCN });
        } else {
            return `${format(start, 'yyyy年MM月dd日', { locale: zhCN })} 至 ${format(end, 'yyyy年MM月dd日', { locale: zhCN })}`;
        }
    }

    /**
     * 获取类型图标
     */
    private getTypeIcon(type: string): string {
        const icons = {
            commit: '📝',
            issue: '🐛',
            merge_request: '🔀',
            pipeline: '🚀'
        };
        return icons[type as keyof typeof icons] || '📄';
    }

    /**
     * 获取类型显示名称
     */
    private getTypeDisplayName(type: string): string {
        const names = {
            commit: '提交',
            issue: '问题',
            merge_request: '合并请求',
            pipeline: '流水线'
        };
        return names[type as keyof typeof names] || type;
    }

    /**
     * 格式化状态
     */
    private formatState(state: string): string {
        const stateMap = {
            opened: '🟢 打开',
            closed: '🔴 关闭',
            merged: '🟣 已合并',
            success: '✅ 成功',
            failed: '❌ 失败',
            running: '🔄 运行中',
            pending: '⏳ 等待中',
            canceled: '⏹️ 已取消'
        };
        return stateMap[state as keyof typeof stateMap] || state;
    }

    /**
     * 按字段分组
     */
    private groupByField<T extends Record<string, any>>(items: T[], field: keyof T): Record<string, T[]> {
        return items.reduce((groups, item) => {
            const key = String(item[field]);
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {} as Record<string, T[]>);
    }

    /**
     * 检查是否为同一天
     */
    private isSameDay(date1: Date, date2: Date): boolean {
        return format(date1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd');
    }

    /**
     * 生成简短摘要
     */
    generateSummary(filterResult: FilterResult, timeRange: DateRange): string {
        const { activities, statistics } = filterResult;

        if (activities.length === 0) {
            return `在${this.formatTimeRange(timeRange)}期间没有找到匹配的活动。`;
        }

        const parts: string[] = [];
        parts.push(`在${this.formatTimeRange(timeRange)}期间`);
        parts.push(`共有 ${statistics.total} 个活动`);

        // 添加主要活动类型
        const topTypes = Object.entries(statistics.byType)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([type, count]) => `${count}个${this.getTypeDisplayName(type)}`);

        if (topTypes.length > 0) {
            parts.push(`包括 ${topTypes.join('、')}`);
        }

        // 添加主要项目
        const topProjects = Object.entries(statistics.byProject)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([project]) => project);

        if (topProjects.length > 0) {
            parts.push(`主要涉及 ${topProjects.join('、')} 等项目`);
        }

        return parts.join('，') + '。';
    }
}

// 导出单例实例
export const markdownFormatter = new MarkdownFormatter();

// 导出便捷函数
export function formatActivitiesMarkdown(
    filterResult: FilterResult,
    timeRange: DateRange,
    options: FormatOptions = {}
): string {
    return markdownFormatter.formatActivities(filterResult, timeRange, options);
}

export function generateActivitySummary(filterResult: FilterResult, timeRange: DateRange): string {
    return markdownFormatter.generateSummary(filterResult, timeRange);
}