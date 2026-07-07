import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  TabType, User, DailyGoal, FocusSession, ScreenLockConfig, LockStatus,
  Achievement, DigitalPet, StudyGroup, StudyRoom, Post, Topic, Message, Note,
  CoupleRelation, CoupleNote, CoupleChallenge, Milestone, RadarData, WeeklyReport
} from '../types';
import * as mock from '../mock/data';
import { genId } from '../utils';

const defaultLockConfig: ScreenLockConfig = {
  mode: 'focus', duration: 25,
  blockedApps: ['微信', '抖音', '微博', '王者荣耀'],
  emergencyUnlock: true, penaltyPoints: 5,
};
const defaultFocusSession: FocusSession = {
  id: '', mode: 'focus', totalMinutes: 25,
  elapsedMinutes: 0, status: 'paused', startTime: new Date().toISOString(),
};

export interface AppState {
  // ---- 认证 ----
  isLoggedIn: boolean;
  token: string | null;
  serverUrl: string;
  login: (token: string, user: User) => void;
  logout: () => void;
  setServerUrl: (url: string) => void;

  // 导航
  currentTab: TabType;
  setTab: (tab: TabType) => void;
  user: User;
  updateUser: (up: Partial<User>) => void;
  goals: DailyGoal[];
  addGoal: (g: { title: string; type: DailyGoal['type']; target: number; unit: string }) => void;
  toggleGoal: (id: string) => void;
  removeGoal: (id: string) => void;
  checkinDays: number;
  lastCheckin: string | null;
  todayCheckedIn: boolean;
  doCheckin: () => void;
  lockConfig: ScreenLockConfig;
  lockState: LockStatus;
  focusSession: FocusSession;
  todayMinutes: number;
  totalMinutes: number;
  startFocus: (minutes: number) => void;
  pauseFocus: () => void;
  resumeFocus: () => void;
  stopFocus: () => void;
  emergencyUnlock: () => void;
  tickFocus: () => void;
  achievements: Achievement[];
  lastAchievementCheck: string;
  checkAchievements: () => void;
  pets: DigitalPet[];
  feedPet: (id: string) => void;
  playPet: (id: string) => void;
  rankUsers: typeof mock.rankUsers;
  groups: StudyGroup[];
  toggleJoinGroup: (id: string) => void;
  rooms: StudyRoom[];
  roomUserCounts: Record<string, number>;
  joinRoom: (id: string) => void;
  leaveRoom: (id: string) => void;
  notes: Note[];
  posts: Post[];
  topics: Topic[];
  toggleLike: (id: string) => void;
  addPost: (p: { content: string; tags: string[]; type: Post['type'] }) => void;
  messages: Message[];
  markRead: (id: string) => void;
  sendMessage: (m: { title: string; content: string; type: Message['type'] }) => void;
  isBound: boolean;
  coupleRelation: CoupleRelation | null;
  coupleNotes: CoupleNote[];
  coupleChallenges: CoupleChallenge[];
  milestones: Milestone[];
  bindPartner: (name: string) => void;
  sendCoupleNote: (content: string, type: CoupleNote['type']) => void;
  updateChallenge: (id: string, progress: number) => void;
  addMilestone: (title: string, icon: string) => void;
  radarData: RadarData[];
  weeklyReport: WeeklyReport;
  generateReport: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ---- 认证 ----
      isLoggedIn: false,
      token: null,
      serverUrl: 'https://tongxue-server-production.up.railway.app',
      login: (token, user) => set({ isLoggedIn: true, token, user }),
      logout: () => set({ isLoggedIn: false, token: null, currentTab: 'home' }),
      setServerUrl: (url) => set({ serverUrl: url }),

      // ---- 导航 ----
      currentTab: 'home',
      setTab: (tab) => set({ currentTab: tab }),
      user: { ...mock.currentUser },

      target: 0, unit: '', type: undefined as any,
      updateUser: (up) => set((s) => ({ user: { ...s.user, ...up } })),
      goals: mock.todaysGoals.map(g => ({ ...g })),
      addGoal: (g) => set((s) => ({
        goals: [...s.goals, {
          id: 'g_' + genId(), title: g.title, type: g.type,
          target: g.target, progress: 0, unit: g.unit,
          completed: false, date: new Date().toISOString().slice(0, 10),
        }],
      })),
      toggleGoal: (id) => set((s) => ({
        goals: s.goals.map(g => g.id === id ? { ...g, completed: !g.completed, progress: g.completed ? 0 : g.target } : g),
      })),
      removeGoal: (id) => set((s) => ({ goals: s.goals.filter(g => g.id !== id) })),
      checkinDays: 12,
      lastCheckin: '2026-07-03',
      todayCheckedIn: false,
      doCheckin: () => {
        const s = get();
        if (s.todayCheckedIn) return;
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const isConsecutive = s.lastCheckin === yesterday;
        set({
          todayCheckedIn: true, lastCheckin: today,
          checkinDays: isConsecutive ? s.checkinDays + 1 : 1,
          user: { ...s.user, consecutiveDays: isConsecutive ? s.checkinDays + 1 : 1 },
        });
        get().checkAchievements();
      },
      lockConfig: defaultLockConfig,
      lockState: 'unlocked',
      focusSession: defaultFocusSession,
      todayMinutes: 85,
      totalMinutes: mock.currentUser.totalStudyHours * 60,
      startFocus: (minutes) => set({
        lockState: 'locked',
        focusSession: { id: 'fs_' + Date.now(), mode: 'focus', totalMinutes: minutes, elapsedMinutes: 0, status: 'running', startTime: new Date().toISOString() },
      }),
      pauseFocus: () => set((s) => ({ focusSession: { ...s.focusSession, status: 'paused' as const } })),
      resumeFocus: () => set((s) => ({ focusSession: { ...s.focusSession, status: 'running' as const } })),
      stopFocus: () => set((s) => {
        const elapsed = s.focusSession.elapsedMinutes;
        return {
          lockState: 'unlocked' as LockStatus,
          focusSession: { ...s.focusSession, status: 'completed' as const },
          todayMinutes: s.todayMinutes + elapsed,
          totalMinutes: s.totalMinutes + elapsed,
          user: { ...s.user, totalStudyHours: (s.totalMinutes + elapsed) / 60 },
        };
      }),
      emergencyUnlock: () => set((s) => ({
        lockState: 'emergency' as LockStatus,
        focusSession: { ...s.focusSession, status: 'interrupted' as const },
        user: { ...s.user, creditScore: Math.max(0, s.user.creditScore - 5) },
      })),
      tickFocus: () => set((s) => {
        if (s.focusSession.status !== 'running') return {};
        const elapsed = Math.floor((Date.now() - new Date(s.focusSession.startTime).getTime()) / 60000);
        if (elapsed >= s.focusSession.totalMinutes) {
          return {
            focusSession: { ...s.focusSession, elapsedMinutes: s.focusSession.totalMinutes, status: 'completed' as const },
            lockState: 'unlocked' as LockStatus,
          };
        }
        return { focusSession: { ...s.focusSession, elapsedMinutes: elapsed } };
      }),
      achievements: mock.achievements.map(a => ({ ...a })),
      lastAchievementCheck: '',
      checkAchievements: () => {
        const s = get();
        const today = new Date().toISOString().slice(0, 10);
        if (s.lastAchievementCheck === today) return;
        set({
          achievements: s.achievements.map(a => {
            if (a.unlocked) return a;
            if (a.id === 'a1' && s.checkinDays >= 1) return { ...a, unlocked: true, unlockedAt: today };
            if (a.id === 'a2' && s.checkinDays >= 7) return { ...a, unlocked: true, unlockedAt: today };
            if (a.id === 'a3' && s.checkinDays >= 30) return { ...a, unlocked: true, unlockedAt: today };
            if (a.id === 'a5' && s.totalMinutes >= 6000) return { ...a, unlocked: true, unlockedAt: today };
            if (a.id === 'a6' && s.totalMinutes >= 30000) return { ...a, unlocked: true, unlockedAt: today };
            if (a.id === 'a7' && s.totalMinutes >= 60000) return { ...a, unlocked: true, unlockedAt: today };
            return a;
          }),
          lastAchievementCheck: today,
        });
      },
      pets: mock.pets.map(p => ({ ...p })),
      feedPet: (id) => set((s) => ({
        pets: s.pets.map(p => p.id === id ? { ...p, hunger: Math.min(100, p.hunger + 20), exp: Math.min(p.maxExp, p.exp + 10) } : p),
      })),
      playPet: (id) => set((s) => ({
        pets: s.pets.map(p => p.id === id ? { ...p, happiness: Math.min(100, p.happiness + 25), exp: Math.min(p.maxExp, p.exp + 15) } : p),
      })),
      rankUsers: [...mock.rankUsers],
      groups: mock.groups.map(g => ({ ...g })),
      toggleJoinGroup: (id) => set((s) => ({
        groups: s.groups.map(g => g.id === id ? { ...g, isMember: !g.isMember, memberCount: g.isMember ? g.memberCount - 1 : g.memberCount + 1 } : g),
      })),
      rooms: mock.studyRooms.map(r => ({ ...r })),
      roomUserCounts: {},
      joinRoom: (id) => set((s) => ({
        rooms: s.rooms.map(r => r.id === id && r.userCount < r.maxUsers ? { ...r, userCount: r.userCount + 1 } : r),
      })),
      leaveRoom: (id) => set((s) => ({
        rooms: s.rooms.map(r => r.id === id ? { ...r, userCount: Math.max(1, r.userCount - 1) } : r),
      })),
      notes: [...mock.notes],
      posts: [...mock.posts],
      topics: [...mock.topics],
      toggleLike: (id) => set((s) => ({
        posts: s.posts.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p),
      })),
      addPost: (p) => set((s) => ({
        posts: [{ id: 'pst_' + genId(), userId: 'u1', nickname: s.user.nickname, avatar: '', type: p.type, content: p.content, images: [], likes: 0, liked: false, comments: 0, createdAt: new Date().toISOString(), tags: p.tags }, ...s.posts],
      })),
      messages: [...mock.messages],
      markRead: (id) => set((s) => ({ messages: s.messages.map(m => m.id === id ? { ...m, read: true } : m) })),
      sendMessage: (m) => set((s) => ({
        messages: [{ id: 'm_' + genId(), type: m.type, title: m.title, content: m.content, fromAvatar: '', read: false, createdAt: new Date().toISOString() }, ...s.messages],
      })),
      isBound: true,
      coupleRelation: mock.coupleRelation ? { ...mock.coupleRelation } : null,
      coupleNotes: mock.coupleNotes.map(n => ({ ...n })),
      coupleChallenges: mock.coupleChallenges.map(c => ({ ...c })),
      milestones: mock.milestones.map(m => ({ ...m })),
      bindPartner: (name) => set({
        isBound: true,
        coupleRelation: { partnerId: 'p_' + genId(), partnerName: name, partnerAvatar: '', bindDate: new Date().toISOString(), totalStudyTogether: 0, daysTogether: 0 },
        milestones: [{ id: 'ml_' + genId(), title: '绑定情侣', date: new Date().toISOString(), icon: '💕' }],
      }),
      sendCoupleNote: (content, type) => set((s) => ({
        coupleNotes: [{ id: 'cn_' + genId(), fromId: 'u1', fromName: s.user.nickname, content, type, createdAt: new Date().toISOString(), read: false }, ...s.coupleNotes],
      })),
      updateChallenge: (id, progress) => set((s) => ({ coupleChallenges: s.coupleChallenges.map(c => c.id === id ? { ...c, progress: Math.min(c.target, progress) } : c) })),
      addMilestone: (title, icon) => set((s) => ({ milestones: [{ id: 'ml_' + genId(), title, date: new Date().toISOString(), icon }, ...s.milestones] })),
      radarData: [...mock.radarData],
      weeklyReport: { ...mock.weeklyReport, achievements: mock.weeklyReport.achievements.map(a => ({ ...a })) },
      generateReport: () => {
        const s = get();
        const days = [0,1,2,3,4,5,6].map(i => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().slice(0, 10); });
        const simMinutes = days.map(() => Math.floor(Math.random() * 120 + 30));
        const total = simMinutes.reduce((a, b) => a + b, 0);
        set({ weeklyReport: { weekStart: days[0], weekEnd: days[6], dailyMinutes: simMinutes, totalMinutes: total, rank: Math.floor(Math.random() * 10) + 1, achievements: s.achievements.filter(a => a.unlocked), averageScore: Math.floor(Math.random() * 20 + 60) } });
      },
    }),
    {
      name: 'tongxue-storage',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        token: state.token,
        serverUrl: state.serverUrl,
        user: state.user,
        goals: state.goals,
        checkinDays: state.checkinDays,
        lastCheckin: state.lastCheckin,
        todayCheckedIn: state.todayCheckedIn,
        todayMinutes: state.todayMinutes,
        totalMinutes: state.totalMinutes,
        achievements: state.achievements,
        pets: state.pets,
        posts: state.posts,
        messages: state.messages,
        coupleNotes: state.coupleNotes,
        coupleChallenges: state.coupleChallenges,
        milestones: state.milestones,
        isBound: state.isBound,
        coupleRelation: state.coupleRelation,
        notes: state.notes,
        groups: state.groups,
      }),
    }
  )
);
