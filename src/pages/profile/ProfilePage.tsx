import { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import Avatar from '../../components/ui/Avatar';
import { useAppStore } from '../../store/useAppStore';
import { formatTime, getRarityStyle } from '../../utils';

type ProfileView = 'overview' | 'achievements' | 'pets' | 'report';

export default function ProfilePage() {
  const { user, updateUser, achievements, checkAchievements, pets, feedPet, playPet, radarData, weeklyReport, generateReport, totalMinutes, todayMinutes, checkinDays, lastCheckin } = useAppStore();
  const [view, setView] = useState<ProfileView>('overview');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user.nickname);

  // 每次进入概览/成就页时检查成就解锁
  useEffect(() => {
    if (view === 'overview' || view === 'achievements') {
      checkAchievements();
    }
  }, [view, checkAchievements]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const views: { key: ProfileView; label: string }[] = [
    { key: 'overview', label: '📊 概览' },
    { key: 'achievements', label: '🏅 成就' },
    { key: 'pets', label: '🐾 宠物' },
    { key: 'report', label: '📋 周报' },
  ];

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      {/* 用户信息 */}
      <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white text-center">
        <Avatar name={user.nickname} size="xl" className="mx-auto ring-4 ring-white/30" />
        <div className="flex items-center justify-center gap-2 mt-3">
          {editingName ? (
            <div className="flex gap-2">
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                className="px-3 py-1 rounded-lg text-gray-800 text-sm" />
              <Button size="sm" variant="ghost" onClick={() => { updateUser({ nickname: newName }); setEditingName(false); }}
                className="text-white">保存</Button>
              <Button size="sm" variant="ghost" onClick={() => { setNewName(user.nickname); setEditingName(false); }}
                className="text-white">取消</Button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold">{user.nickname}</h2>
              <button onClick={() => setEditingName(true)} className="text-white/70 text-sm">✏️</button>
            </>
          )}
        </div>
        <p className="text-sm text-white/80 mt-0.5">{user.title} · Lv.{user.level}</p>
        <div className="flex justify-center gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{user.creditScore}</p>
            <p className="text-[10px] text-white/70">信用分</p>
          </div>
          <div className="w-px bg-white/20" />
          <div className="text-center">
            <p className="text-2xl font-bold">{formatTime(totalMinutes)}</p>
            <p className="text-[10px] text-white/70">累计学习</p>
          </div>
          <div className="w-px bg-white/20" />
          <div className="text-center">
            <p className="text-2xl font-bold">{checkinDays}</p>
            <p className="text-[10px] text-white/70">连续天数</p>
          </div>
        </div>
      </Card>

      {/* 分段 */}
      <div className="flex gap-1.5">
        {views.map((v) => (
          <button key={v.key} onClick={() => setView(v.key)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              view === v.key ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'
            }`}>{v.label}</button>
        ))}
      </div>

      {view === 'overview' && (
        <>
          <Card>
            <h3 className="font-bold text-gray-800 mb-3">📈 能力雷达</h3>
            <div className="flex justify-center">
              <div className="relative w-52 h-52">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {[0.2, 0.4, 0.6, 0.8, 1].map((r, i) => (
                    <polygon key={i} points={radarData.map((_, j) => {
                      const a = (j * 72 - 90) * Math.PI / 180;
                      return `${100 + r * 75 * Math.cos(a)},${100 + r * 75 * Math.sin(a)}`;
                    }).join(' ')} fill="none" stroke="#e5e7eb" strokeWidth="1" />
                  ))}
                  <polygon points={radarData.map((d, i) => {
                    const a = (i * 72 - 90) * Math.PI / 180;
                    const r = (d.value / 100) * 75;
                    return `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`;
                  }).join(' ')} fill="rgba(99,102,241,0.2)" stroke="#6366f1" strokeWidth="2" />
                  {radarData.map((d, i) => {
                    const a = (i * 72 - 90) * Math.PI / 180;
                    const r = (d.value / 100) * 75;
                    return (
                      <g key={i}>
                        <circle cx={100 + r * Math.cos(a)} cy={100 + r * Math.sin(a)} r="4" fill="#6366f1" />
                        <text x={190 + Math.cos(a) * 25} y={100 + Math.sin(a) * 25}
                          textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#4b5563" fontWeight="500">
                          {d.label}</text>
                        <text x={100 + r * Math.cos(a)} y={100 + r * Math.sin(a) - 10}
                          textAnchor="middle" fontSize="10" fill="#6366f1" fontWeight="bold">{d.value}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <span className="text-2xl">💳</span>
              <p className="text-lg font-bold text-gray-800 mt-2">{user.creditScore} / 100</p>
              <p className="text-xs text-gray-400">信用分</p>
              <ProgressBar value={user.creditScore} max={100} color="bg-green-500" height="h-1.5" className="mt-2" />
            </Card>
            <Card>
              <span className="text-2xl">🏅</span>
              <p className="text-lg font-bold text-gray-800 mt-2">{unlockedCount}/{achievements.length}</p>
              <p className="text-xs text-gray-400">已解锁成就</p>
              <ProgressBar value={unlockedCount} max={achievements.length} color="bg-yellow-500" height="h-1.5" className="mt-2" />
            </Card>
            <Card>
              <span className="text-2xl">📊</span>
              <p className="text-lg font-bold text-gray-800 mt-2">Lv.{user.level}</p>
              <p className="text-xs text-gray-400">用户等级</p>
            </Card>
            <Card>
              <span className="text-2xl">🐾</span>
              <p className="text-lg font-bold text-gray-800 mt-2">{pets.filter(p => p.unlocked).length}/{pets.length}</p>
              <p className="text-xs text-gray-400">宠物数量</p>
            </Card>
          </div>
        </>
      )}

      {view === 'achievements' && (
        <>
          <Card>
            <h3 className="font-bold text-gray-800">🏅 成就勋章墙</h3>
            <p className="text-xs text-gray-400 mt-1">已解锁 {unlockedCount}/{achievements.length}</p>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((a) => {
              const s = getRarityStyle(a.rarity);
              return (
                <Card key={a.id} className={`text-center ${a.unlocked ? '' : 'opacity-50'}`}>
                  <span className="text-4xl block">{a.icon}</span>
                  <h4 className="font-semibold text-sm text-gray-800 mt-2">{a.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{a.description}</p>
                  <Badge variant={a.rarity === 'legendary' ? 'danger' : a.rarity === 'epic' ? 'info' : a.rarity === 'rare' ? 'warning' : 'default'} className="mt-2">
                    {a.rarity === 'legendary' ? '传说' : a.rarity === 'epic' ? '史诗' : a.rarity === 'rare' ? '稀有' : '普通'}
                  </Badge>
                  {a.unlocked && a.unlockedAt && (
                    <p className="text-[10px] text-gray-400 mt-1">解锁于 {a.unlockedAt}</p>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}

      {view === 'pets' && (
        <>
          <Card>
            <h3 className="font-bold text-gray-800">🐾 数字宠物</h3>
            <p className="text-xs text-gray-400 mt-1">坚持学习让你的宠物成长！</p>
          </Card>
          {pets.filter(p => p.unlocked).length === 0 && (
            <Card className="text-center py-6">
              <span className="text-4xl">🥚</span>
              <p className="text-sm text-gray-400 mt-2">还没有宠物，继续学习解锁吧</p>
            </Card>
          )}
          {pets.filter(p => p.unlocked).map((pet) => (
            <Card key={pet.id} className={`border-l-4 ${getRarityStyle(pet.rarity).border}`}>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{pet.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-800">{pet.name}</h4>
                    <Badge variant={pet.rarity === 'legendary' ? 'danger' : pet.rarity === 'epic' ? 'info' : pet.rarity === 'rare' ? 'warning' : 'default'}>
                      {pet.rarity === 'legendary' ? '传说' : pet.rarity === 'epic' ? '史诗' : pet.rarity === 'rare' ? '稀有' : '普通'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Lv.{pet.level} · {pet.exp}/{pet.maxExp} EXP</p>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-2"><span className="text-xs text-gray-400 w-8">饱食</span>
                      <ProgressBar value={pet.hunger} max={100} color="bg-green-500" height="h-1.5" />
                      <span className="text-xs text-gray-400 w-8 text-right">{pet.hunger}%</span>
                      <button onClick={() => feedPet(pet.id)} className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">🍎喂食</button>
                    </div>
                    <div className="flex items-center gap-2"><span className="text-xs text-gray-400 w-8">心情</span>
                      <ProgressBar value={pet.happiness} max={100} color="bg-pink-500" height="h-1.5" />
                      <span className="text-xs text-gray-400 w-8 text-right">{pet.happiness}%</span>
                      <button onClick={() => playPet(pet.id)} className="text-xs px-2 py-1 bg-pink-100 text-pink-600 rounded-full">🎾玩耍</button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {pets.filter(p => !p.unlocked).length > 0 && (
            <>
              <p className="text-sm font-semibold text-gray-600 mt-3">🔒 待解锁</p>
              {pets.filter(p => !p.unlocked).map((pet) => (
                <Card key={pet.id} className="opacity-60 text-center py-4">
                  <span className="text-4xl">🔒</span>
                  <p className="font-semibold text-sm text-gray-600 mt-1">{pet.rarity === 'legendary' ? '???' : pet.name}</p>
                  <Badge variant={pet.rarity === 'legendary' ? 'danger' : pet.rarity === 'epic' ? 'info' : pet.rarity === 'rare' ? 'warning' : 'default'}>
                    {pet.rarity === 'legendary' ? '传说' : pet.rarity === 'epic' ? '史诗' : pet.rarity === 'rare' ? '稀有' : '普通'}
                  </Badge>
                </Card>
              ))}
            </>
          )}
        </>
      )}

      {view === 'report' && (
        <>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800">📋 学习周报</h3>
              <p className="text-xs text-gray-400 mt-1">{weeklyReport.weekStart} ~ {weeklyReport.weekEnd}</p>
            </div>
            <Badge variant="info">排名 #{weeklyReport.rank}</Badge>
          </Card>

          {/* 柱状图 */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-800">每日学习（分钟）</h4>
              <Button size="sm" variant="ghost" onClick={generateReport}>🔄 刷新</Button>
            </div>
            <div className="flex items-end justify-between h-32 gap-1">
              {weeklyReport.dailyMinutes.map((m, i) => {
                const max = Math.max(...weeklyReport.dailyMinutes, 1);
                const height = (m / max) * 100;
                const days = ['一', '二', '三', '四', '五', '六', '日'];
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 mb-1">{m}</span>
                    <div className="w-full rounded-t-lg transition-all duration-500"
                      style={{ height: `${height}%`, backgroundColor: i === 6 ? '#6366f1' : '#a5b4fc', minHeight: m > 0 ? '4px' : '2px' }} />
                    <span className="text-[10px] text-gray-400 mt-1">{days[i]}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400">本周总时长</p>
                <p className="text-xl font-bold text-primary-600">{formatTime(weeklyReport.totalMinutes)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">综合评分</p>
                <p className="text-xl font-bold text-primary-600">{weeklyReport.averageScore}</p>
              </div>
            </div>
          </Card>

          {/* 本周成就 */}
          <Card>
            <h4 className="font-bold text-gray-800 mb-3">🏅 本周成就</h4>
            {weeklyReport.achievements.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">本周还未获得成就</p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {weeklyReport.achievements.map((a) => (
                  <div key={a.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full">
                    <span>{a.icon}</span>
                    <span className="text-xs text-gray-600">{a.name}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Button variant="primary" fullWidth>📤 分享周报</Button>
        </>
      )}
    </div>
  );
}
