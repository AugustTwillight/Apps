import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAppStore } from '../../store/useAppStore';
import { timeAgo } from '../../utils';
import type { MessageType } from '../../types';

export default function MessagePage() {
  const { messages, markRead, sendMessage, user } = useAppStore();
  const [filter, setFilter] = useState<MessageType | 'all'>('all');
  const [showCompose, setShowCompose] = useState(false);
  const [toTitle, setToTitle] = useState('');
  const [toContent, setToContent] = useState('');
  const [toType, setToType] = useState<MessageType>('private');

  const filtered = filter === 'all' ? messages : messages.filter(m => m.type === filter);
  const unreadCount = messages.filter(m => !m.read).length;

  const filters: { key: MessageType | 'all'; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'system', label: '🔔 系统' },
    { key: 'group', label: '👥 小组' },
    { key: 'private', label: '💬 私信' },
  ];

  const handleSend = () => {
    if (!toTitle.trim() || !toContent.trim()) return;
    sendMessage({ title: toTitle, content: toContent, type: toType });
    setToTitle('');
    setToContent('');
    setShowCompose(false);
  };

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">💬 消息</h2>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && <Badge variant="danger">{unreadCount} 条未读</Badge>}
          <button onClick={() => setShowCompose(!showCompose)} className="text-sm text-primary-600 font-medium">
            {showCompose ? '取消' : '+ 发消息'}
          </button>
        </div>
      </div>

      {/* 筛选 */}
      <div className="flex gap-1 flex-wrap">
        {filters.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f.key ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}>{f.label}</button>
        ))}
      </div>

      {/* 发消息 */}
      {showCompose && (
        <Card>
          <div className="space-y-2">
            <input type="text" placeholder="收件人 / 标题" value={toTitle}
              onChange={e => setToTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
            <textarea placeholder="输入消息内容..." value={toContent} rows={3}
              onChange={e => setToContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none" />
            <div className="flex items-center gap-2">
              <select value={toType} onChange={e => setToType(e.target.value as MessageType)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="private">私信</option>
                <option value="group">小组消息</option>
                <option value="system">系统通知</option>
              </select>
              <Button size="sm" variant="primary" onClick={handleSend} disabled={!toTitle.trim() || !toContent.trim()}>
                发送 ✉️
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 消息列表 */}
      {filtered.length === 0 && (
        <Card className="text-center py-8">
          <span className="text-4xl">📭</span>
          <p className="text-gray-500 mt-2">暂无消息</p>
        </Card>
      )}
      {filtered.map((msg) => (
        <Card key={msg.id} onClick={() => markRead(msg.id)} className="flex items-start gap-3 cursor-pointer">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
            msg.type === 'system' ? 'bg-blue-100' : msg.type === 'group' ? 'bg-green-100' : 'bg-purple-100'
          }`}>
            {msg.type === 'system' ? '🔔' : msg.type === 'group' ? '👥' : '💬'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-gray-800">{msg.title}</h4>
                <Badge variant={msg.type === 'system' ? 'info' : msg.type === 'group' ? 'success' : 'warning'}>
                  {msg.type === 'system' ? '系统' : msg.type === 'group' ? '小组' : '私信'}
                </Badge>
              </div>
              <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{timeAgo(msg.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1 truncate">{msg.content}</p>
            {!msg.read && <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mt-1" />}
          </div>
        </Card>
      ))}
    </div>
  );
}
