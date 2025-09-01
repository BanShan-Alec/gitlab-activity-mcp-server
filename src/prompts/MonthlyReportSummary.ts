import { MCPPrompt } from 'mcp-framework';
import { z } from 'zod';

interface MonthlyReportSummarySchema {
  reportData: string;
}

class MonthlyReportSummary extends MCPPrompt<MonthlyReportSummarySchema> {
  name = 'monthly_report_summary';
  description = '将 GitLab 活动数据转换为面向团队同事的月度轻松汇报（默认包含量化指标）';
  schema = {
    reportData: {
      type: z.string(),
      description: 'GitLab 月度活动数据',
      required: true,
    },
  };

  async generateMessages(args: MonthlyReportSummarySchema) {
    const { reportData } = args;

    // 固定：风格为 casual，受众为 team，默认包含量化指标
    const basePrompt = `
请基于以下 GitLab 活动数据，生成一份轻松的团队月度工作汇报：

${reportData}

报告要求：
- 语调轻松友好，避免过于正式
- 面向团队同事，内容有助于团队协作和知识分享
- 默认包含量化指标（例如：提交次数、合并请求数量、代码评审次数、Bug 修复数等）
- 重点说明本月有趣或有挑战的工作
- 可以分享一些工作中的小故事或心得
- 长度适中，结构清晰，易于阅读

请生成包含以下内容的汇报：
1. **这个月干了啥**（主要工作内容）
2. **有意思的事情**（技术亮点、解决的难题）
3. **数字指标**（提交次数、PR/MR 数、评审次数、Bug 修复数等）
4. **踩过的坑**（遇到的问题和学到的经验）
5. **下个月计划**（即将要做的事）`;

    return [
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: basePrompt,
        },
      },
    ];
  }
}

export default MonthlyReportSummary;
