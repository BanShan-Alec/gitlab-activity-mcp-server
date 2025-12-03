import { ActivityType } from '../constant/activityType';

// GitLab API 类型定义
export interface GitLabEvent {
  id: number;
  title?: string;
  project_id: number;
  action_name: string;
  target_id: number;
  target_iid?: number;
  target_type: string;
  author_id: number;
  target_title?: string;
  created_at: string;
  author: {
    name: string;
    username: string;
    id: number;
    state: string;
    avatar_url: string;
    web_url: string;
  };
  author_username: string;
  imported: boolean;
  imported_from: string;
  push_data?: {
    commit_count: number;
    commit_from: string;
    commit_to: string;
    commit_title: string;
    ref: string;
    ref_type: string;
    ref_count: number;
  };
  note?: {
    id: number;
    body: string;
    attachment?: string;
    author: {
      name: string;
      username: string;
      id: number;
      state: string;
      avatar_url: string;
      web_url: string;
    };
    created_at: string;
    system: boolean;
    noteable_id: number;
    noteable_type: string;
    noteable_iid?: number;
  };
}

export interface GitLabActivity {
  type: 'commit' | 'merge_request';
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
  projectName: string;
  projectId: number;
  webUrl: string;
  author: string;
  authorId: number;
  state?: string;
  labels?: string[];
  action?: string;
}

// GitLab User API 响应类型
export interface GitlabUser {
  // 基本信息（必需字段）
  id: number;
  username: string;
  name: string;
  state: string;
  avatar_url: string;
  web_url: string;
  created_at: string;

  // 邮箱信息
  email?: string;
  public_email?: string;
  commit_email?: string;

  // 个人资料
  bio?: string;
  location?: string;
  linkedin?: string;
  twitter?: string;
  discord?: string;
  website_url?: string;
  github?: string;
  job_title?: string;
  pronouns?: string;
  organization?: string;
  work_information?: string | null;

  // 账户状态
  locked?: boolean;
  bot?: boolean;
  external?: boolean;
  private_profile?: boolean;
  confirmed_at?: string;
  last_sign_in_at?: string;
  current_sign_in_at?: string;
  last_activity_on?: string;
  local_time?: string;

  // 权限和配置
  can_create_group?: boolean;
  can_create_project?: boolean;
  two_factor_enabled?: boolean;
  projects_limit?: number;
  theme_id?: number;
  color_scheme_id?: number;
  preferred_language?: string;

  // 身份认证
  identities?: Array<{
    provider: string;
    extern_uid: string;
  }>;
}

// GitLab Commits API 响应类型
export interface GitLabCommit {
  id: string; // SHA
  short_id: string;
  title: string;
  message: string;
  author_name: string;
  author_email: string;
  authored_date: string;
  committer_name: string;
  committer_email: string;
  committed_date: string;
  created_at: string;
  parent_ids: string[];
  web_url: string;
  trailers?: Record<string, string>;
  extended_trailers?: Record<string, string[]>;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

// 项目信息类型
export interface GitLabProject {
  id: number;
  name: string;
  name_with_namespace: string;
  path: string;
  path_with_namespace: string;
  web_url: string;
  description?: string;
}

export interface FilterResult {
  activities: GitLabActivity[];
  matchReasons: Map<string, string[]>; // 活动ID -> 匹配原因列表
  statistics: {
    total: number;
    byType: Record<ActivityType, number>; // 按活动类型统计
    byProject: Record<string, number>; // 按项目名称统计
  };
}
