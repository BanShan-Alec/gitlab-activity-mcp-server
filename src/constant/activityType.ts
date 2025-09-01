export const ACTIVITY_TYPE_KEYWORDS = {
  bug_fix: {
    // bug修复相关关键词
    keywords: [
      // 英文
      'fix',
      'bugfix',
      'hotfix',
      'patch',
      'resolve',
      'solved',
      'repair',
      // 中文
      '修复',
      '修正',
      '解决',
      '修改',
      '补丁',
      '热修复',
      '紧急修复',
      'bug',
      // commit前缀
      'fix:',
      'hotfix:',
      'patch:',
    ],
    description: 'Bug修复',
  },
  feature: {
    // 新功能相关关键词
    keywords: [
      // 英文
      'feat',
      'feature',
      'add',
      'new',
      'implement',
      'create',
      'develop',
      // 中文
      '新增',
      '添加',
      '功能',
      '特性',
      '开发',
      '实现',
      '创建',
      '新功能',
      // commit前缀
      'feat:',
      'feature:',
    ],
    description: '新功能',
  },
  improvement: {
    // 改进优化相关关键词
    keywords: [
      // 英文
      'improve',
      'enhancement',
      'optimize',
      'refactor',
      'update',
      'upgrade',
      'enhance',
      // 中文
      '优化',
      '改进',
      '增强',
      '提升',
      '重构',
      '更新',
      '升级',
      '完善',
      // commit前缀
      'perf:',
      'refactor:',
      'style:',
    ],
    description: '改进优化',
  },
  documentation: {
    // 文档相关关键词
    keywords: [
      // 英文
      'docs',
      'documentation',
      'readme',
      'comment',
      'guide',
      'manual',
      // 中文
      '文档',
      '说明',
      '注释',
      '帮助',
      '指南',
      '手册',
      // commit前缀
      'docs:',
    ],
    description: '文档更新',
  },
  test: {
    // 测试相关关键词
    keywords: [
      // 英文
      'test',
      'testing',
      'spec',
      'unit test',
      'integration test',
      // 中文
      '测试',
      '单元测试',
      '集成测试',
      '测试用例',
      // commit前缀
      'test:',
    ],
    description: '测试',
  },
  config: {
    // 配置相关关键词
    keywords: [
      // 英文
      'config',
      'configuration',
      'setting',
      'env',
      'environment',
      // 中文
      '配置',
      '设置',
      '环境',
      '参数',
      // commit前缀
      'chore:',
      'ci:',
    ],
    description: '配置更改',
  },
  other: {
    // 其他未分类活动
    keywords: [],
    description: '其他',
  },
};

export type ActivityType = keyof typeof ACTIVITY_TYPE_KEYWORDS;
