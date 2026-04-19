import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import type { Task, Review } from '../types';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewed, setReviewed] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTask = async () => {
    const res = await api.get(`/tasks/${id}`);
    setTask(res.data);
    setLoading(false);
    if (user) {
      const check: any = await api.get(`/reviews/task/${id}/check`).catch(() => ({ data: { reviewed: false } }));
      setReviewed(check.data.reviewed);
    }
  };

  useEffect(() => { loadTask(); }, [id, user]);

  const handleAccept = async () => {
    await api.post(`/tasks/${id}/accept`);
    loadTask();
  };

  const handleStart = async () => {
    await api.post(`/tasks/${id}/start`);
    loadTask();
  };

  const handleComplete = async () => {
    await api.post(`/tasks/${id}/complete`);
    loadTask();
  };

  const handleCancel = async () => {
    if (!confirm('确定取消任务吗？')) return;
    await api.post(`/tasks/${id}/cancel`);
    navigate('/orders');
  };

  const handleReview = async () => {
    if (reviewed) return;
    await api.post('/reviews', { task_id: id, rating: reviewRating, comment: reviewText });
    setReviewed(true);
    loadTask();
  };

  if (loading) return <div className="p-4 text-center text-gray-400 py-12">加载中...</div>;
  if (!task) return <div className="p-4 text-center text-red-400 py-12">任务不存在</div>;

  const isOwner = user?.id === task.owner_id;
  const isWalker = user?.id === task.walker_id;
  const statusLabel: Record<string, { text: string; color: string }> = {
    pending: { text: '待接单', color: 'bg-yellow-100 text-yellow-700' },
    accepted: { text: '已接单', color: 'bg-blue-100 text-blue-700' },
    in_progress: { text: '进行中', color: 'bg-purple-100 text-purple-700' },
    completed: { text: '已完成', color: 'bg-green-100 text-green-700' },
    cancelled: { text: '已取消', color: 'bg-gray-100 text-gray-500' },
  };
  const serviceEmoji: Record<string, string> = { walk: '🐕', feed: '🐱', other: '🐾' };
  const serviceLabel: Record<string, string> = { walk: '遛狗', feed: '上门喂猫', other: '其他' };

  return (
    <div className="p-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{serviceEmoji[task.service_type]}</span>
            <h2 className="font-bold text-gray-800">{task.title}</h2>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabel[task.status].color}`}>{statusLabel[task.status].text}</span>
        </div>
        <p className="text-amber-600 text-xl font-bold mb-3">¥{task.reward}</p>
        <p className="text-gray-500 text-sm mb-2">📍 {task.location_name || '未指定'}</p>
        <p className="text-gray-500 text-sm mb-2">📅 {task.task_date} {task.task_time_start} - {task.task_time_end}</p>
        <p className="text-gray-500 text-sm mb-2">🐾 宠物：{task.pet_name}（{task.pet_breed || serviceLabel[task.service_type]}）</p>
        {task.description && <p className="text-gray-600 text-sm mt-2 p-3 bg-gray-50 rounded-xl">{task.description}</p>}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <h3 className="font-semibold text-gray-700 mb-3">相关信息</h3>
        {isOwner && task.walker_id && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">🚶</div>
            <div>
              <p className="font-medium text-gray-800">{task.walker_nickname}</p>
              <p className="text-xs text-gray-400">代遛师 ⭐{task.walker_rating?.toFixed(1) || '新'}</p>
            </div>
          </div>
        )}
        {!isOwner && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">🐶</div>
            <div>
              <p className="font-medium text-gray-800">{task.owner_nickname}</p>
              <p className="text-xs text-gray-400">宠物主 ⭐{task.owner_rating?.toFixed(1) || '新'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {task.status === 'pending' && isOwner && (
          <button onClick={handleCancel} className="w-full py-3 border border-red-300 text-red-500 rounded-xl font-medium hover:bg-red-50 transition">取消任务</button>
        )}
        {task.status === 'pending' && !isOwner && (
          <button onClick={handleAccept} className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition">立即抢单</button>
        )}
        {task.status === 'accepted' && isWalker && (
          <button onClick={handleStart} className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition">开始服务</button>
        )}
        {(task.status === 'accepted' || task.status === 'in_progress') && (
          <button onClick={handleComplete} className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition">确认完成</button>
        )}
        {task.status === 'completed' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-3">发布评价</h3>
            {reviewed ? (
              <p className="text-green-600 text-center py-2">✅ 已评价，感谢您的反馈！</p>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewRating(s)} className={`text-2xl transition ${s <= reviewRating ? 'text-amber-400' : 'text-gray-300'}`}>⭐</button>
                  ))}
                </div>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} className="w-full px-4 py-2 border rounded-xl" rows={2} placeholder="分享您的体验..." />
                <button onClick={handleReview} className="w-full py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition">提交评价</button>
              </div>
            )}
          </div>
        )}
        {['pending', 'accepted', 'in_progress'].includes(task.status) && (
          <button onClick={() => navigate(`/chat/${task.id}`)} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition">💬 联系对方</button>
        )}
      </div>
    </div>
  );
}
