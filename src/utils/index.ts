export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${month}/${day} ${weekdays[d.getDay()]}`;
}

export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = now - d;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

export function getAvatarColor(name: string): string {
  const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function getInitial(name: string): string {
  return name.charAt(0);
}

export function getRankStyle(rank: number): { bg: string; text: string; icon: string } {
  if (rank === 1) return { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: '🥇' };
  if (rank === 2) return { bg: 'bg-gray-100', text: 'text-gray-500', icon: '🥈' };
  if (rank === 3) return { bg: 'bg-orange-100', text: 'text-orange-600', icon: '🥉' };
  return { bg: 'bg-gray-50', text: 'text-gray-400', icon: '' };
}

export function getRarityStyle(rarity: string): { bg: string; text: string; border: string } {
  switch (rarity) {
    case 'legendary': return { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-400' };
    case 'epic': return { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-400' };
    case 'rare': return { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-400' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' };
  }
}

export function genId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function formatNumber(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}
