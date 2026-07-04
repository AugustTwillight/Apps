import type {
  User, DailyGoal, RankUser, Achievement, DigitalPet,
  StudyGroup, StudyRoom, Post, Topic, Message, Note,
  CoupleRelation, CoupleNote, CoupleChallenge, Milestone,
  RadarData, WeeklyReport, FocusSession
} from '../types';

export const currentUser: User = {
  id: 'u1',
  nickname: '学习达人小明',
  avatar: '',
  creditScore: 85,
  depositAmount: 100,
  totalStudyHours: 256,
  consecutiveDays: 12,
  level: 8,
  title: '自律之星'
};

export const todaysGoals: DailyGoal[] = [
  { id: 'g1', type: 'duration', title: '专注学习', target: 120, progress: 85, unit: '分钟', completed: false, date: '2026-07-04' },
  { id: 'g2', type: 'task', title: '完成数学作业', target: 1, progress: 1, unit: '项', completed: true, date: '2026-07-04' },
  { id: 'g3', type: 'checkin', title: '晨间打卡', target: 1, progress: 1, unit: '次', completed: true, date: '2026-07-04' },
  { id: 'g4', type: 'duration', title: '英语听力', target: 30, progress: 20, unit: '分钟', completed: false, date: '2026-07-04' }
];

export const rankUsers: RankUser[] = [
  { id: 'u1', nickname: '学习达人小明', avatar: '', value: 480, rank: 1, change: 'up' },
  { id: 'u2', nickname: '考研战士小红', avatar: '', value: 420, rank: 2, change: 'same' },
  { id: 'u3', nickname: '码农小张', avatar: '', value: 390, rank: 3, change: 'up' },
  { id: 'u4', nickname: '学霸小丽', avatar: '', value: 350, rank: 4, change: 'down' },
  { id: 'u5', nickname: '自律小李', avatar: '', value: 310, rank: 5, change: 'same' }
];

export const achievements: Achievement[] = [
  { id: 'a1', name: '初学者', icon: '🌱', category: 'persistence', description: '坚持学习1天', unlocked: true, rarity: 'common' },
  { id: 'a2', name: '坚持达人', icon: '🌿', category: 'persistence', description: '连续打卡7天', unlocked: true, rarity: 'rare' },
  { id: 'a3', name: '自律之星', icon: '🌳', category: 'persistence', description: '连续打卡30天', unlocked: false, rarity: 'epic' },
  { id: 'a4', name: '学习之王', icon: '👑', category: 'persistence', description: '连续打卡100天', unlocked: false, rarity: 'legendary' },
  { id: 'a5', name: '百小时', icon: '⏰', category: 'duration', description: '累计学习100小时', unlocked: true, rarity: 'common' },
  { id: 'a6', name: '五百小时', icon: '⌛', category: 'duration', description: '累计学习500小时', unlocked: false, rarity: 'rare' },
  { id: 'a7', name: '千小时', icon: '🔥', category: 'duration', description: '累计学习1000小时', unlocked: false, rarity: 'legendary' },
  { id: 'a8', name: '监督先锋', icon: '🤝', category: 'social', description: '邀请3位好友', unlocked: true, rarity: 'common' },
  { id: 'a9', name: '团队之星', icon: '⭐', category: 'social', description: '小组活跃度第一', unlocked: false, rarity: 'epic' },
  { id: 'a10', name: '早起鸟', icon: '🐦', category: 'challenge', description: '连续7天6点前起床', unlocked: true, rarity: 'rare' },
  { id: 'a11', name: '夜猫子', icon: '🦉', category: 'challenge', description: '连续7天学习到23点', unlocked: false, rarity: 'rare' }
];

export const pets: DigitalPet[] = [
  { id: 'p1', name: '小书虫', type: '书虫', emoji: '🐛', rarity: 'common', level: 5, exp: 230, maxExp: 500, hunger: 60, happiness: 80, unlocked: true },
  { id: 'p2', name: '智慧树', type: '树精', emoji: '🌳', rarity: 'rare', level: 3, exp: 120, maxExp: 400, hunger: 40, happiness: 65, unlocked: true },
  { id: 'p3', name: '小火龙', type: '龙', emoji: '🐲', rarity: 'epic', level: 1, exp: 10, maxExp: 200, hunger: 90, happiness: 30, unlocked: false },
  { id: 'p4', name: '凤凰', type: '神鸟', emoji: '🦅', rarity: 'legendary', level: 0, exp: 0, maxExp: 100, hunger: 100, happiness: 50, unlocked: false }
];

export const groups: StudyGroup[] = [
  { id: 'gr1', name: '考研冲刺群', avatar: '', memberCount: 12, maxMembers: 20, type: 'public', description: '一起冲刺考研上岸！', totalHours: 3200, rank: 1, deposit: 100, isMember: true },
  { id: 'gr2', name: '英语学习小组', avatar: '', memberCount: 8, maxMembers: 15, type: 'private', description: '英语听说读写全面提升', totalHours: 1800, rank: 3, deposit: 50, isMember: true },
  { id: 'gr3', name: '编程爱好者', avatar: '', memberCount: 20, maxMembers: 20, type: 'audit', description: 'LeetCode刷题+项目实战', totalHours: 5600, rank: 2, deposit: 200, isMember: false }
];

export const studyRooms: StudyRoom[] = [
  { id: 'r1', name: '📚 深夜书海', type: 'public', userCount: 15, maxUsers: 50, topic: '自由学习', isActive: true },
  { id: 'r2', name: '🏆 考研冲刺房', type: 'group', userCount: 8, maxUsers: 20, topic: '考研复习', isActive: true },
  { id: 'r3', name: '❤️ 情侣自习', type: 'duo', userCount: 2, maxUsers: 2, topic: '共同学习', isActive: true },
  { id: 'r4', name: '🎯 专注小屋', type: 'solo', userCount: 1, maxUsers: 1, topic: '深度学习', isActive: true },
  { id: 'r5', name: '🌅 清晨之光', type: 'public', userCount: 6, maxUsers: 30, topic: '早起打卡', isActive: true }
];

export const notes: Note[] = [
  { id: 'n1', fromName: '考研战士小红', fromAvatar: '', content: '加油！你一定能行的！💪', type: 'encourage', createdAt: '2026-07-04T08:30:00', read: false, roomId: 'r2' },
  { id: 'n2', fromName: '匿名同学', fromAvatar: '', content: '别偷懒啦，大家都在学习呢😏', type: 'funny', createdAt: '2026-07-04T09:15:00', read: false, roomId: 'r1' },
  { id: 'n3', fromName: '学霸小丽', fromAvatar: '', content: '今天的数学题第三题有坑，注意一下', type: 'encourage', createdAt: '2026-07-04T10:00:00', read: true, roomId: 'r1' }
];

export const messages: Message[] = [
  { id: 'm1', type: 'system', title: '打卡提醒', content: '你已连续打卡12天，再坚持3天可获得"坚持达人"勋章！', read: false, createdAt: '2026-07-04T07:00:00' },
  { id: 'm2', type: 'system', title: '押金通知', content: '本周押金结算：你已达标，获得返还100元并额外获得3元奖励！', read: false, createdAt: '2026-07-04T00:00:00' },
  { id: 'm3', type: 'group', title: '考研冲刺群', content: '小红：今天的数学模拟题大家都做了吗？', fromAvatar: '', read: false, createdAt: '2026-07-04T10:30:00' },
  { id: 'm4', type: 'group', title: '英语学习小组', content: '小张：今晚8点口语练习，准时参加哦', fromAvatar: '', read: true, createdAt: '2026-07-04T09:00:00' },
  { id: 'm5', type: 'private', title: '考研战士小红', content: '明天一起早起去图书馆占座吗？', fromAvatar: '', read: true, createdAt: '2026-07-03T22:00:00' },
  { id: 'm6', type: 'private', title: '学霸小丽', content: '数学笔记发你了，记得查收', fromAvatar: '', read: true, createdAt: '2026-07-03T20:00:00' },
  { id: 'm7', type: 'system', title: '版本更新', content: 'v2.0 已上线！新增情侣伴学功能，快去体验吧 ❤️', read: true, createdAt: '2026-07-03T12:00:00' }
];

export const posts: Post[] = [
  { id: 'pst1', userId: 'u2', nickname: '考研战士小红', avatar: '', type: 'dynamic', content: '今天完成了数学模拟卷，虽然只考了120分，但比上周进步了10分！继续加油💪', images: [], likes: 15, liked: true, comments: 5, createdAt: '2026-07-04T09:00:00', tags: ['考研', '数学'] },
  { id: 'pst2', userId: 'u3', nickname: '码农小张', avatar: '', type: 'dynamic', content: 'LeetCode每日一题打卡第47天！今天的题目是一个树的遍历，用DFS解决了', images: [], likes: 23, liked: false, comments: 8, createdAt: '2026-07-04T08:30:00', tags: ['编程', 'LeetCode'] },
  { id: 'pst3', userId: 'u4', nickname: '学霸小丽', avatar: '', type: 'challenge', content: '【七日共学挑战】找一位学习伙伴，每天一起学习3小时，互相监督打卡！', images: [], likes: 45, liked: false, comments: 12, createdAt: '2026-07-03T20:00:00', tags: ['挑战', '监督'] },
  { id: 'pst4', userId: 'u5', nickname: '自律小李', avatar: '', type: 'topic', content: '大家觉得早上学习效率高还是晚上？我觉得早上背单词效果最好！', images: [], likes: 30, liked: true, comments: 20, createdAt: '2026-07-03T18:00:00', tags: ['话题', '学习方法'] },
  { id: 'pst5', userId: 'u1', nickname: '学习达人小明', avatar: '', type: 'dynamic', content: '今天和小红一起在情侣自习室学习了2小时，效率超高！有人一起学习的感觉真好 ❤️', images: [], likes: 67, liked: false, comments: 15, createdAt: '2026-07-03T16:00:00', tags: ['情侣', '自习室'] }
];

export const topics: Topic[] = [
  { id: 't1', name: '考研经验', icon: '📚', postCount: 128, hot: true },
  { id: 't2', name: '学习方法', icon: '🧠', postCount: 95, hot: true },
  { id: 't3', name: '自习打卡', icon: '✅', postCount: 256, hot: true },
  { id: 't4', name: '情侣学习', icon: '❤️', postCount: 67, hot: false },
  { id: 't5', name: '编程交流', icon: '💻', postCount: 89, hot: true },
  { id: 't6', name: '英语学习', icon: '🌍', postCount: 73, hot: false },
  { id: 't7', name: '每日挑战', icon: '🏆', postCount: 45, hot: false },
  { id: 't8', name: '宠物乐园', icon: '🐾', postCount: 34, hot: false }
];

export const radarData: RadarData[] = [
  { label: '专注力', value: 85 },
  { label: '坚持度', value: 70 },
  { label: '学习量', value: 80 },
  { label: '达成率', value: 75 },
  { label: '活跃度', value: 65 }
];

export const weeklyReport: WeeklyReport = {
  weekStart: '2026-06-28',
  weekEnd: '2026-07-04',
  dailyMinutes: [120, 90, 150, 60, 180, 200, 85],
  totalMinutes: 885,
  rank: 3,
  achievements: achievements.filter(a => a.unlocked),
  averageScore: 75
};

export const coupleRelation: CoupleRelation = {
  partnerId: 'u2',
  partnerName: '考研战士小红',
  partnerAvatar: '',
  bindDate: '2026-06-01',
  totalStudyTogether: 85,
  daysTogether: 34
};

export const coupleNotes: CoupleNote[] = [
  { id: 'cn1', fromId: 'u2', fromName: '考研战士小红', content: '今天也要一起加油哦 ❤️', type: 'encourage', createdAt: '2026-07-04T07:00:00', read: false },
  { id: 'cn2', fromId: 'u1', fromName: '学习达人小明', content: '想你了~在干嘛呢', type: 'miss', createdAt: '2026-07-03T20:00:00', read: true },
  { id: 'cn3', fromId: 'u2', fromName: '考研战士小红', content: '你认真的样子真的好帅 😊', type: 'sweet', createdAt: '2026-07-03T15:00:00', read: true },
  { id: 'cn4', fromId: 'u1', fromName: '学习达人小明', content: '今晚要不要一起去深夜书海？', type: 'encourage', createdAt: '2026-07-03T12:00:00', read: true },
  { id: 'cn5', fromId: 'u2', fromName: '考研战士小红', content: '哈哈你今天又解锁了一个成就，好厉害！', type: 'funny', createdAt: '2026-07-02T18:00:00', read: true }
];

export const coupleChallenges: CoupleChallenge[] = [
  { id: 'cc1', title: '七日共学', target: 7, progress: 5, unit: '天', daysLeft: 2, active: true },
  { id: 'cc2', title: '百小时冲刺', target: 100, progress: 85, unit: '小时', daysLeft: 15, active: true }
];

export const milestones: Milestone[] = [
  { id: 'ml1', title: '绑定情侣', date: '2026-06-01', icon: '💕' },
  { id: 'ml2', title: '第一次共同学习', date: '2026-06-01', icon: '📖' },
  { id: 'ml3', title: '共学10小时', date: '2026-06-07', icon: '⏰' },
  { id: 'ml4', title: '连续共学7天', date: '2026-06-14', icon: '🔥' },
  { id: 'ml5', title: '共学50小时', date: '2026-06-25', icon: '⭐' },
  { id: 'ml6', title: '第100张纸条', date: '2026-07-01', icon: '💌' }
];

export const defaultFocusSession: FocusSession = {
  id: 'fs1',
  mode: 'focus',
  totalMinutes: 25,
  elapsedMinutes: 0,
  status: 'paused',
  startTime: new Date().toISOString()
};
