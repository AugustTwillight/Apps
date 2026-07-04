// ========== 用户相关 ==========
export interface User {
  id: string;
  nickname: string;
  avatar: string;
  creditScore: number;
  depositAmount: number;
  totalStudyHours: number;
  consecutiveDays: number;
  level: number;
  title: string;
}

// ========== 目标管理 ==========
export type GoalType = 'duration' | 'task' | 'checkin' | 'custom';

export interface DailyGoal {
  id: string;
  type: GoalType;
  title: string;
  target: number;
  progress: number;
  unit: string;
  completed: boolean;
  date: string;
}

// ========== 学习记录 ==========
export interface StudyRecord {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  subject: string;
  status: 'completed' | 'interrupted' | 'pending';
}

// ========== 排行榜 ==========
export type RankType = 'daily' | 'consecutive' | 'weekly' | 'group';

export interface RankUser {
  id: string;
  nickname: string;
  avatar: string;
  value: number;
  rank: number;
  change: 'up' | 'down' | 'same';
}

// ========== 成就系统 ==========
export interface Achievement {
  id: string;
  name: string;
  icon: string;
  category: 'persistence' | 'duration' | 'social' | 'challenge';
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// ========== 数字宠物 ==========
export type PetRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface DigitalPet {
  id: string;
  name: string;
  type: string;
  emoji: string;
  rarity: PetRarity;
  level: number;
  exp: number;
  maxExp: number;
  hunger: number;
  happiness: number;
  unlocked: boolean;
}

// ========== 小组 ==========
export type GroupType = 'public' | 'private' | 'audit';

export interface StudyGroup {
  id: string;
  name: string;
  avatar: string;
  memberCount: number;
  maxMembers: number;
  type: GroupType;
  description: string;
  totalHours: number;
  rank: number;
  deposit: number;
  isMember: boolean;
}

// ========== 自习室 ==========
export type RoomType = 'solo' | 'duo' | 'group' | 'public';

export interface StudyRoom {
  id: string;
  name: string;
  type: RoomType;
  userCount: number;
  maxUsers: number;
  topic: string;
  isActive: boolean;
}

// ========== 屏幕锁定 ==========
export type LockMode = 'focus' | 'deep' | 'custom';
export type LockStatus = 'unlocked' | 'locked' | 'emergency';

export interface ScreenLockConfig {
  mode: LockMode;
  duration: number;
  blockedApps: string[];
  emergencyUnlock: boolean;
  penaltyPoints: number;
}

export interface FocusSession {
  id: string;
  mode: LockMode;
  totalMinutes: number;
  elapsedMinutes: number;
  status: 'running' | 'paused' | 'completed' | 'interrupted';
  startTime: string;
}

// ========== 情侣 ==========
export interface CoupleRelation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  bindDate: string;
  totalStudyTogether: number;
  daysTogether: number;
}

export type CoupleNoteType = 'encourage' | 'miss' | 'funny' | 'sweet' | 'voice';

export interface CoupleNote {
  id: string;
  fromId: string;
  fromName: string;
  content: string;
  type: CoupleNoteType;
  createdAt: string;
  read: boolean;
}

export interface CoupleChallenge {
  id: string;
  title: string;
  target: number;
  progress: number;
  unit: string;
  daysLeft: number;
  active: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  icon: string;
}

// ========== 社区 ==========
export type PostType = 'dynamic' | 'challenge' | 'topic';

export interface Post {
  id: string;
  userId: string;
  nickname: string;
  avatar: string;
  type: PostType;
  content: string;
  images: string[];
  likes: number;
  liked: boolean;
  comments: number;
  createdAt: string;
  tags: string[];
}

export interface Topic {
  id: string;
  name: string;
  icon: string;
  postCount: number;
  hot: boolean;
}

// ========== 消息 ==========
export type MessageType = 'system' | 'group' | 'private';

export interface Message {
  id: string;
  type: MessageType;
  title: string;
  content: string;
  fromAvatar?: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// ========== 纸条 ==========
export interface Note {
  id: string;
  fromName: string;
  fromAvatar: string;
  content: string;
  type: string;
  createdAt: string;
  read: boolean;
  roomId?: string;
}

// ========== 导航 ==========
export type TabType = 'home' | 'study' | 'couple' | 'community' | 'message' | 'profile';

export interface TabItem {
  key: TabType;
  icon: string;
  activeIcon: string;
  label: string;
}

// ========== 能力雷达 ==========
export interface RadarData {
  label: string;
  value: number;
}

// ========== 周报 ==========
export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  dailyMinutes: number[];
  totalMinutes: number;
  rank: number;
  achievements: Achievement[];
  averageScore: number;
}
