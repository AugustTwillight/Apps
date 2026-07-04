import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { useAppStore } from '../../store/useAppStore';
import { timeAgo, formatNumber } from '../../utils';
import type { PostType } from '../../types';

export default function CommunityPage() {
  const { posts, topics, toggleLike, addPost, user } = useAppStore();
  const [activeTab, setActiveTab] = useState<PostType>('dynamic');
  const [showComposer, setShowComposer] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newType, setNewType] = useState<PostType>('dynamic');

  const filteredPosts = posts.filter(p => p.type === activeTab);

  const handlePost = () => {
    if (!newContent.trim()) return;
    const tags = newTags.split(/[,，\s]+/).filter(Boolean);
    addPost({ content: newContent, tags: tags.length ? tags : ['日常'], type: newType });
    setNewContent('');
    setNewTags('');
    setShowComposer(false);
  };

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      <div className="flex gap-2">
        {([
          { key: 'dynamic' as PostType, label: '📝 动态' },
          { key: 'challenge' as PostType, label: '🏆 挑战' },
          { key: 'topic' as PostType, label: '💬 话题' },
        ]).map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === t.key ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'
            }`}>{t.label}</button>
        ))}
      </div>

      {/* 发布按钮 */}
      {!showComposer && (
        <Button variant="primary" fullWidth onClick={() => setShowComposer(true)}>✏️ 发布动态</Button>
      )}

      {/* 发帖编辑器 */}
      {showComposer && (
        <Card>
          <h3 className="font-bold text-gray-800 mb-2">📝 发布</h3>
          <textarea placeholder="分享你的学习心得..." value={newContent} rows={3}
            onChange={e => setNewContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 resize-none" />
          <div className="flex items-center gap-2 mt-2">
            <input type="text" placeholder="标签（逗号分隔）" value={newTags}
              onChange={e => setNewTags(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
            <select value={newType} onChange={e => setNewType(e.target.value as PostType)}
              className="px-2 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="dynamic">动态</option>
              <option value="challenge">挑战</option>
              <option value="topic">话题</option>
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="primary" size="sm" onClick={handlePost} disabled={!newContent.trim()}>发布</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowComposer(false)}>取消</Button>
          </div>
        </Card>
      )}

      {/* 帖子列表 */}
      {filteredPosts.length === 0 && (
        <Card className="text-center py-8">
          <span className="text-4xl">📭</span>
          <p className="text-gray-500 mt-2">暂无内容，快来发布第一条吧</p>
        </Card>
      )}
      {filteredPosts.map((post) => (
        <Card key={post.id}>
          <div className="flex items-start gap-3">
            <Avatar name={post.nickname} size="md" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-gray-800">{post.nickname}</h4>
                <Badge variant={post.type === 'dynamic' ? 'default' : post.type === 'challenge' ? 'warning' : 'info'}>
                  {post.type === 'dynamic' ? '动态' : post.type === 'challenge' ? '挑战' : '话题'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{post.content}</p>
              {post.tags.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleLike(post.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 active:scale-110 transition-transform">
                    <span>{post.liked ? '❤️' : '🤍'}</span>
                    <span className={post.liked ? 'text-red-500' : ''}>{post.likes}</span>
                  </button>
                  <span className="flex items-center gap-1 text-xs text-gray-400">💬 {post.comments}</span>
                </div>
                <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* 热门话题 */}
      <Card>
        <h3 className="font-bold text-gray-800 mb-3">🔥 热门话题</h3>
        <div className="grid grid-cols-2 gap-2">
          {topics.slice(0, 6).map((topic) => (
            <div key={topic.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
              <span className="text-xl">{topic.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">#{topic.name}</p>
                <p className="text-[10px] text-gray-400">{formatNumber(topic.postCount)} 帖子</p>
              </div>
              {topic.hot && <Badge variant="danger">🔥</Badge>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
