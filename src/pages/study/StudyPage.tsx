import { useState, useEffect, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { useAppStore } from '../../store/useAppStore';
import { formatDuration } from '../../utils';

type StudyView = 'timer' | 'rooms' | 'notes';

export default function StudyPage() {
  const { focusSession, lockState, rooms, notes, startFocus, pauseFocus, resumeFocus, stopFocus, emergencyUnlock, tickFocus, joinRoom, leaveRoom, roomUserCounts } = useAppStore();
  const [view, setView] = useState<StudyView>('timer');
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [showLock, setShowLock] = useState(false);
  const [myRooms, setMyRooms] = useState<Set<string>>(new Set());
  const [noteText, setNoteText] = useState('');

  // 计时器同步
  useEffect(() => {
    if (focusSession.status !== 'running') return;
    const timer = setInterval(tickFocus, 5000);
    const handleVis = () => { if (!document.hidden) tickFocus(); };
    document.addEventListener('visibilitychange', handleVis);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', handleVis); };
  }, [focusSession.status, tickFocus]);

  const handleStart = useCallback(() => {
    startFocus(selectedMinutes);
    setShowLock(true);
  }, [selectedMinutes, startFocus]);

  const progress = focusSession.totalMinutes > 0
    ? Math.round((focusSession.elapsedMinutes / focusSession.totalMinutes) * 100) : 0;
  const timeLeft = Math.max(0, focusSession.totalMinutes - focusSession.elapsedMinutes);

  const durations = [
    { label: '番茄钟', minutes: 25, icon: '🍅' },
    { label: '深度学习', minutes: 45, icon: '🧠' },
    { label: '小组专注', minutes: 60, icon: '👥' },
    { label: '快速', minutes: 15, icon: '⚡' },
  ];

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      <div className="flex gap-2">
        {([
          { key: 'timer' as const, label: '⏱️ 计时器' },
          { key: 'rooms' as const, label: '🏠 房间' },
          { key: 'notes' as const, label: '💌 纸条' },
        ]).map((v) => (
          <button key={v.key} onClick={() => setView(v.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              view === v.key ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'
            }`}>
            {v.label}
          </button>
        ))}
      </div>

      {/* 计时器 */}
      {view === 'timer' && (
        <>
          {/* 锁定提示 */}
          {showLock && lockState === 'locked' && (
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 text-center">
              <span className="text-4xl">🔒</span>
              <h3 className="font-bold text-gray-800 mt-2">专注中</h3>
              <p className="text-sm text-gray-500 mt-1">专注时间：{formatDuration(timeLeft * 60)}</p>
              <div className="flex gap-2 justify-center mt-3">
                <Button variant="ghost" size="sm" onClick={() => setShowLock(false)}>隐藏</Button>
                <Button variant="danger" size="sm" onClick={() => { emergencyUnlock(); setShowLock(false); }}>⚡ 紧急解锁</Button>
              </div>
            </Card>
          )}
          {showLock && lockState === 'emergency' && (
            <Card className="bg-red-50 border-red-200 text-center">
              <span className="text-4xl">⚠️</span>
              <h3 className="font-bold text-gray-800 mt-2">已紧急解锁（信用分-5）</h3>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowLock(false)}>关闭</Button>
            </Card>
          )}

          {/* 圆环倒计时 */}
          <Card className="text-center">
            <div className="relative w-44 h-44 mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#6366f1" strokeWidth="6"
                  strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                  className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-800">{formatDuration(timeLeft * 60)}</span>
                <span className="text-sm text-gray-400 mt-1">
                  {focusSession.status === 'running' ? '学习中...' : focusSession.status === 'paused' ? '已暂停' : '准备就绪'}
                </span>
                {focusSession.status === 'completed' && (
                  <span className="text-xs text-green-500 font-medium mt-1">✅ 完成！</span>
                )}
              </div>
            </div>
          </Card>

          {/* 时长选择 */}
          <div className="grid grid-cols-4 gap-2">
            {durations.map((d) => (
              <button key={d.minutes} onClick={() => !showLock && setSelectedMinutes(d.minutes)}
                className={`p-3 rounded-xl text-center transition-all ${
                  selectedMinutes === d.minutes && !showLock
                    ? 'bg-primary-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600'
                }`}>
                <span className="text-xl">{d.icon}</span>
                <p className="text-xs font-bold mt-1">{d.label}</p>
                <p className="text-[10px] opacity-75">{d.minutes}分钟</p>
              </button>
            ))}
          </div>

          {/* 控制按钮 */}
          <div className="flex gap-3">
            {focusSession.status === 'running' ? (
              <>
                <Button variant="outline" fullWidth onClick={pauseFocus}>⏸️ 暂停</Button>
                <Button variant="danger" fullWidth onClick={stopFocus}>⏹️ 结束</Button>
              </>
            ) : focusSession.status === 'paused' ? (
              <>
                <Button variant="primary" fullWidth onClick={resumeFocus}>▶️ 继续</Button>
                <Button variant="ghost" fullWidth onClick={stopFocus}>❌ 结束</Button>
              </>
            ) : (
              <Button variant="primary" fullWidth onClick={handleStart} disabled={showLock}>
                🚀 开始专注
              </Button>
            )}
          </div>
        </>
      )}

      {/* 房间列表 */}
      {view === 'rooms' && (
        <>
          <Card>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-800">🏠 虚拟自习室</h3>
              <Badge variant="success">{rooms.filter(r => r.isActive).length} 个活跃</Badge>
            </div>
            <p className="text-xs text-gray-400 mb-3">选择房间进入，与伙伴一起学习</p>
          </Card>
          {rooms.map((room) => {
            const isJoined = myRooms.has(room.id);
            return (
              <Card key={room.id} className="flex items-center gap-3">
                <span className="text-3xl">{room.name.charAt(0)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-800">{room.name}</h4>
                    <Badge variant={room.type === 'solo' ? 'default' : room.type === 'duo' ? 'warning' : room.type === 'group' ? 'info' : 'success'}>
                      {room.type === 'solo' ? '单人' : room.type === 'duo' ? '双人' : room.type === 'group' ? '小组' : '公共'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">📌 {room.topic}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <span>👤 {room.userCount}/{room.maxUsers}</span>
                    {isJoined && <Badge variant="success">已进入</Badge>}
                  </div>
                </div>
                {isJoined ? (
                  <Button size="sm" variant="ghost" onClick={() => { leaveRoom(room.id); setMyRooms(prev => { const n = new Set(prev); n.delete(room.id); return n; }); }}>
                    退出
                  </Button>
                ) : (
                  <Button size="sm" variant="primary" disabled={room.userCount >= room.maxUsers}
                    onClick={() => { if (room.userCount < room.maxUsers) { setMyRooms(prev => new Set(prev).add(room.id)); } }}>
                    {room.userCount >= room.maxUsers ? '已满' : '进入'}
                  </Button>
                )}
              </Card>
            );
          })}
        </>
      )}

      {/* 纸条 */}
      {view === 'notes' && (
        <>
          <Card>
            <h3 className="font-bold text-gray-800">💌 纸条收件箱</h3>
            <p className="text-xs text-gray-400 mt-1">来自学习伙伴的鼓励与提醒</p>
            <div className="flex gap-2 mt-3">
              <input type="text" placeholder="写一张鼓励纸条..." value={noteText}
                onChange={e => setNoteText(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400" />
              <Button size="sm" variant="primary" disabled={!noteText.trim()} onClick={() => {
                if (!noteText.trim()) return;
                const s = useAppStore.getState();
                s.sendCoupleNote ? s.sendCoupleNote(noteText, 'encourage') : null;
                setNoteText('');
              }}>
                发送 ✉️
              </Button>
            </div>
          </Card>
          {notes.length === 0 && (
            <Card className="text-center py-6">
              <span className="text-3xl">📭</span>
              <p className="text-sm text-gray-400 mt-2">暂无纸条</p>
            </Card>
          )}
          {notes.map((note) => (
            <Card key={note.id} className="flex items-start gap-3">
              <Avatar name={note.fromName} size="md" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-gray-800">{note.fromName}</h4>
                  {!note.read && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
                </div>
                <p className="text-sm text-gray-600 mt-1">{note.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={note.type === 'encourage' ? 'success' : 'warning'}>
                    {note.type === 'encourage' ? '鼓励' : '搞怪'}
                  </Badge>
                  <span className="text-[10px] text-gray-400">
                    {new Date(note.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
