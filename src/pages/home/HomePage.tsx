import { useState } from 'react';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAppStore } from '../../store/useAppStore';
import { formatTime, getRankStyle } from '../../utils';

export default function HomePage() {
  const store = useAppStore();
  const { user, goals, todayMinutes, checkinDays, todayCheckedIn, rankUsers, groups, radarData, setTab, addGoal, toggleGoal, removeGoal, doCheckin } = store;
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', type: 'duration' as const, target: 30, unit: '分钟' });

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'study': setTab('study'); break;
      case 'checkin': doCheckin(); break;
      case 'group': setTab('message'); break;
      case 'challenge': setTab('community'); break;
    }
  };

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return;
    addGoal({ title: newGoal.title, type: newGoal.type, target: newGoal.target, unit: newGoal.unit });
    setNewGoal({ title: '', type: 'duration', target: 30, unit: '分钟' });
    setShowAddGoal(false);
  };

  const completedCount = goals.filter(g => g.completed).length;

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      {/* 用户信息 + 等级 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={user.nickname} size="lg" />
          <div>
            <h2 className="font-bold text-lg text-gray-800">{user.nickname}</h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <Badge variant="info">Lv.{user.level}</Badge>
              <Badge variant="success">信用分 {user.creditScore}</Badge>
              <Badge variant="warning">🔥 {user.consecutiveDays}天</Badge>
              {user.depositAmount > 0 && <Badge variant="default">¥{user.depositAmount}</Badge>}
            </div>
          </div>
        </div>
        <button onClick={() => setTab('profile')} className="text-2xl">⚙️</button>
      </div>

      {/* 今日学习统计 */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">📊 今日学习</h3>
          <span className="text-sm font-bold text-primary-600">{formatTime(todayMinutes)}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: '⏱️', label: '专注', val: formatTime(todayMinutes).replace('分钟', 'm').replace('小时', 'h'), color: 'bg-blue-500' },
            { icon: '✅', label: '任务', val: `${completedCount}/${goals.length}`, color: 'bg-green-500' },
            { icon: '🔥', label: '连胜', val: `${user.consecutiveDays}天`, color: 'bg-orange-500' },
            { icon: '💰', label: '押金', val: `¥${user.depositAmount}`, color: 'bg-purple-500' },
          ].map((s, i) => (
            <div key={i} className="text-center bg-gray-50 rounded-xl py-3">
              <span className="text-xl">{s.icon}</span>
              <p className="text-lg font-bold text-gray-800 mt-1">{s.val}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 快捷操作 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: '🏁', label: '开始学习', action: 'study', color: 'bg-primary-500' },
          { icon: todayCheckedIn ? '✅' : '📋', label: todayCheckedIn ? '已签到' : '打卡', action: 'checkin', color: todayCheckedIn ? 'bg-green-400' : 'bg-green-500' },
          { icon: '👥', label: '小组', action: 'group', color: 'bg-purple-500' },
          { icon: '🏆', label: '挑战', action: 'challenge', color: 'bg-orange-500' },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={() => handleQuickAction(btn.action)}
            className={`flex flex-col items-center gap-1 py-3 rounded-2xl text-white active:scale-95 transition-transform ${btn.color}`}
          >
            <span className="text-2xl">{btn.icon}</span>
            <span className="text-xs font-medium">{btn.label}</span>
          </button>
        ))}
      </div>

      {/* 签到提醒 */}
      {!todayCheckedIn && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200" padding={false}>
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <span className="text-sm text-gray-700">
                今日还未签到 · 已连续 <strong>{checkinDays}</strong> 天
              </span>
            </div>
            <Button size="sm" variant="primary" onClick={doCheckin}>签到</Button>
          </div>
        </Card>
      )}

      {/* 今日目标 */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">🎯 今日目标</h3>
          <button onClick={() => setShowAddGoal(!showAddGoal)} className="text-sm text-primary-600 font-medium">
            {showAddGoal ? '取消' : '+ 添加'}
          </button>
        </div>

        {showAddGoal && (
          <div className="mb-3 p-3 bg-gray-50 rounded-xl space-y-2">
            <input
              type="text" placeholder="目标名称" value={newGoal.title}
              onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
            />
            <div className="flex gap-2">
              <select
                value={newGoal.type}
                onChange={e => setNewGoal({ ...newGoal, type: e.target.value as any })}
                className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
              >
                <option value="duration">⏱️ 时长</option>
                <option value="task">📝 任务</option>
                <option value="checkin">✅ 打卡</option>
              </select>
              <input
                type="number" value={newGoal.target}
                onChange={e => setNewGoal({ ...newGoal, target: Number(e.target.value) })}
                className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none"
              />
              <input
                value={newGoal.unit}
                onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })}
                className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none"
              />
            </div>
            <Button size="sm" fullWidth onClick={handleAddGoal}>添加目标</Button>
          </div>
        )}

        {goals.length === 0 && (
          <p className="text-center text-gray-400 py-4 text-sm">还没有目标，点击右上角添加</p>
        )}

        <div className="space-y-3">
          {goals.map((g) => (
            <div key={g.id} className="group">
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={() => toggleGoal(g.id)}
                  className={`flex items-center gap-2 flex-1 text-left ${g.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}
                >
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] transition-all ${
                    g.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                  }`}>
                    {g.completed ? '✓' : ''}
                  </span>
                  <span className="text-sm font-medium">{g.title}</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{g.progress}/{g.target}{g.unit}</span>
                  <button
                    onClick={() => removeGoal(g.id)}
                    className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <ProgressBar
                value={g.progress}
                max={g.target}
                color={g.completed ? 'bg-green-500' : 'bg-primary-500'}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* 排行榜 */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">🏅 今日排行榜</h3>
          <button onClick={() => setTab('profile')} className="text-xs text-primary-500">查看全部→</button>
        </div>
        {rankUsers.map((u) => {
          const style = getRankStyle(u.rank);
          return (
            <div key={u.id} className="flex items-center gap-3 py-2">
              <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                {style.icon || u.rank}
              </span>
              <Avatar name={u.nickname} size="sm" />
              <span className="flex-1 text-sm font-medium text-gray-700 truncate">{u.nickname}</span>
              <span className="text-sm font-bold text-primary-600">{u.value}分</span>
              <span className={`text-xs ${u.change === 'up' ? 'text-green-500' : u.change === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
                {u.change === 'up' ? '↑' : u.change === 'down' ? '↓' : '→'}
              </span>
            </div>
          );
        })}
      </Card>

      {/* 能力雷达 */}
      <Card>
        <h3 className="font-bold text-gray-800 mb-3">📈 能力雷达</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {[0.2, 0.4, 0.6, 0.8, 1].map((r, i) => (
                <polygon key={i} points={radarData.map((_, j) => {
                  const angle = (j * 72 - 90) * (Math.PI / 180);
                  const radius = r * 80;
                  return `${100 + radius * Math.cos(angle)},${100 + radius * Math.sin(angle)}`;
                }).join(' ')} fill="none" stroke="#e5e7eb" strokeWidth="1" />
              ))}
              <polygon points={radarData.map((d, i) => {
                const angle = (i * 72 - 90) * (Math.PI / 180);
                const radius = (d.value / 100) * 80;
                return `${100 + radius * Math.cos(angle)},${100 + radius * Math.sin(angle)}`;
              }).join(' ')} fill="rgba(99,102,241,0.2)" stroke="#6366f1" strokeWidth="2" />
              {radarData.map((d, i) => {
                const angle = (i * 72 - 90) * (Math.PI / 180);
                const radius = (d.value / 100) * 80;
                return (
                  <text key={i} x={190 + Math.cos(angle) * 25} y={100 + Math.sin(angle) * 25}
                    textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#6b7280">
                    {d.label}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>
      </Card>

      {/* 我的小组 */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">👥 我的小组</h3>
          <span className="text-xs text-gray-400">{groups.filter(g => g.isMember).length} 个</span>
        </div>
        {groups.filter(g => g.isMember).length === 0 && (
          <p className="text-center text-gray-400 py-3 text-sm">还没有加入小组</p>
        )}
        {groups.filter(g => g.isMember).map((g) => (
          <div key={g.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2 last:mb-0">
            <span className="text-2xl">👥</span>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-gray-800">{g.name}</h4>
              <p className="text-xs text-gray-400">成员 {g.memberCount}/{g.maxMembers}</p>
            </div>
            <Badge variant={g.type === 'public' ? 'info' : g.type === 'private' ? 'warning' : 'default'}>
              {g.type === 'public' ? '公开' : g.type === 'private' ? '私密' : '审核'}
            </Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}
