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

export interface GitlabUser {
  id: number;
  username: string;
  name: string;
  avatar_url: string;
  web_url: string;
}

export interface FilterResult {
  activities: GitLabActivity[];
  matchReasons: Map<string, string[]>; // 活动ID -> 匹配原因列表
  statistics: {
    total: number;
    byType: Record<ActivityType, number>; // 按活动类型统计
    byProject: Record<number, number>; // 按项目统计
  };
}
