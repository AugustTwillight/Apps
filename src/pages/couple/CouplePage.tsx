import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import Avatar from '../../components/ui/Avatar';
import { useAppStore } from '../../store/useAppStore';
import { formatDate } from '../../utils';

type CoupleView = 'overview' | 'notes' | 'challenges' | 'milestones';

export default function CouplePage() {
  const { isBound, coupleRelation, coupleNotes, coupleChallenges, milestones,
    bindPartner, sendCoupleNote, updateChallenge, addMilestone } = useAppStore();
  const [view, setView] = useState<CoupleView>('overview');
  const [partnerName, setPartnerName] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<'encourage' | 'miss' | 'funny' | 'sweet'>('encourage');
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');

  if (!isBound) {
    return (
      <div className="px-4 pt-4 pb-24 space-y-4">
        <Card className="text-center py-8">
          <span className="text-6xl">💕</span>
          <h2 className="text-xl font-bold text-gray-800 mt-4">情侣伴学</h2>
          <p className="text-sm text-gray-500 mt-2">和你的TA一起学习，互相监督，共同进步</p>
          <div className="mt-6 space-y-3">
            <input type="text" placeholder="输入TA的昵称" value={partnerName}
              onChange={e => setPartnerName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-lg font-bold text-gray-700 focus:border-pink-500 focus:outline-none" />
            <Button variant="primary" fullWidth onClick={() => bindPartner(partnerName)} disabled={!partnerName}>
              💕 绑定情侣
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const views: { key: CoupleView; label: string }[] = [
    { key: 'overview', label: '❤️ 概况' },
    { key: 'notes', label: '💌 纸条' },
    { key: 'challenges', label: '🏆 挑战' },
    { key: 'milestones', label: '📅 纪念' },
  ];

  const noteTypeOptions: { type: typeof noteType; label: string; icon: string }[] = [
    { type: 'encourage', label: '鼓励', icon: '💪' },
    { type: 'miss', label: '想你', icon: '🥺' },
    { type: 'funny', label: '搞怪', icon: '😏' },
    { type: 'sweet', label: '甜蜜', icon: '😊' },
  ];

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      <div className="flex gap-1.5">
        {views.map((v) => (
          <button key={v.key} onClick={() => setView(v.key)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              view === v.key ? 'bg-pink-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'
            }`}>{v.label}</button>
        ))}
      </div>

      {view === 'overview' && (
        <>
          <Card className="bg-gradient-to-br from-pink-50 to-purple-50 text-center">
            <Avatar name={coupleRelation?.partnerName || 'TA'} size="xl" className="mx-auto" />
            <h2 className="text-lg font-bold text-gray-800 mt-2">{coupleRelation?.partnerName}</h2>
            <Badge variant="warning">💕 已在一起 {coupleRelation?.daysTogether} 天</Badge>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white/80 rounded-xl py-3">
                <p className="text-xl font-bold text-pink-500">{coupleRelation?.totalStudyTogether}h</p>
                <p className="text-xs text-gray-400">共同学习</p>
              </div>
              <div className="bg-white/80 rounded-xl py-3">
                <p className="text-xl font-bold text-pink-500">{coupleRelation?.daysTogether}天</p>
                <p className="text-xs text-gray-400">在一起</p>
              </div>
            </div>
          </Card>

          {/* 快速发纸条 */}
          <Card>
            <h3 className="font-bold text-gray-800 mb-2">💌 发送甜蜜纸条</h3>
            <div className="flex gap-2 mb-2">
              {noteTypeOptions.map((nt) => (
                <button key={nt.type} onClick={() => setNoteType(nt.type)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    noteType === nt.type ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>{nt.icon} {nt.label}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="写你想说的话..." value={noteText}
                onChange={e => setNoteText(e.target.value)}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-pink-500 focus:outline-none" />
              <Button variant="secondary" size="sm" onClick={() => { if (noteText.trim()) { sendCoupleNote(noteText, noteType); setNoteText(''); } }} disabled={!noteText.trim()}>
                发送 💕
              </Button>
            </div>
          </Card>

          {/* 共同目标 */}
          <Card>
            <h3 className="font-bold text-gray-800 mb-3">🎯 共同目标</h3>
            {coupleChallenges.map((c) => (
              <div key={c.id} className="mb-3 last:mb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{c.title}</span>
                  <span className="text-xs text-gray-400">{c.progress}/{c.target}{c.unit}</span>
                </div>
                <ProgressBar value={c.progress} max={c.target} color="bg-pink-500" />
                <div className="flex justify-end mt-1">
                  <Button size="sm" variant="ghost" onClick={() => updateChallenge(c.id, c.progress + 1)}>+ 进度</Button>
                </div>
              </div>
            ))}
          </Card>
        </>
      )}

      {view === 'notes' && (
        <>
          <Card>
            <h3 className="font-bold text-gray-800">💌 甜蜜纸条</h3>
            <p className="text-xs text-gray-400 mt-1">共 {coupleNotes.length} 条</p>
          </Card>
          {coupleNotes.map((note) => (
            <Card key={note.id} className="flex items-start gap-3">
              <Avatar name={note.fromName} size="md" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-gray-800">{note.fromName}</h4>
                  {!note.read && <span className="w-2 h-2 bg-pink-500 rounded-full" />}
                </div>
                <p className="text-sm text-gray-600 mt-1">{note.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={note.type === 'encourage' ? 'success' : note.type === 'miss' ? 'info' : note.type === 'sweet' ? 'warning' : 'default'}>
                    {note.type === 'encourage' ? '鼓励' : note.type === 'miss' ? '想你' : note.type === 'sweet' ? '甜蜜' : '搞怪'}
                  </Badge>
                  <span className="text-[10px] text-gray-400">{formatDate(note.createdAt)}</span>
                </div>
              </div>
            </Card>
          ))}
        </>
      )}

      {view === 'challenges' && (
        <>
          <Card>
            <h3 className="font-bold text-gray-800">🏆 情侣挑战</h3>
            <p className="text-xs text-gray-400 mt-1">一起完成挑战，创造回忆</p>
          </Card>
          {coupleChallenges.map((c) => (
            <Card key={c.id}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-800">{c.title}</h4>
                <Badge variant={c.active ? 'success' : 'default'}>{c.active ? '进行中' : '已完成'}</Badge>
              </div>
              <ProgressBar value={c.progress} max={c.target} color="bg-pink-500" height="h-3" showLabel />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <span>进度: {c.progress}/{c.target}{c.unit}</span>
                <span>剩余 {c.daysLeft} 天</span>
              </div>
              <div className="flex justify-end mt-2">
                <Button size="sm" variant="outline" onClick={() => updateChallenge(c.id, Math.min(c.target, c.progress + 1))}>
                  ➕ 增加进度
                </Button>
              </div>
            </Card>
          ))}
          <Card className="text-center py-6 border-dashed border-2">
            <span className="text-3xl">✨</span>
            <p className="text-sm text-gray-500 mt-2">发起新的挑战</p>
            <Button variant="outline" size="sm" className="mt-3">创建挑战</Button>
          </Card>
        </>
      )}

      {view === 'milestones' && (
        <>
          <Card className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800">📅 爱的里程碑</h3>
              <p className="text-xs text-gray-400 mt-1">记录每一个值得纪念的时刻</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowMilestone(!showMilestone)}>
              + 记录
            </Button>
          </Card>

          {showMilestone && (
            <Card className="bg-pink-50">
              <div className="flex gap-2">
                <input type="text" placeholder="记录今天的特别时刻..." value={milestoneTitle}
                  onChange={e => setMilestoneTitle(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                <Button size="sm" variant="secondary" onClick={() => {
                  if (milestoneTitle.trim()) {
                    addMilestone(milestoneTitle, '💕');
                    setMilestoneTitle('');
                    setShowMilestone(false);
                  }
                }} disabled={!milestoneTitle.trim()}>记录</Button>
              </div>
            </Card>
          )}

          <div className="relative ml-4">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-pink-200" />
            {milestones.map((m) => (
              <div key={m.id} className="flex items-start gap-4 mb-6">
                <div className="relative z-10 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-xs">
                  {m.icon}
                </div>
                <Card className="flex-1 -mt-1">
                  <h4 className="font-semibold text-sm text-gray-800">{m.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(m.date)}</p>
                </Card>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
