import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import type { Task } from '../types';

export default function Orders() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadTasks = async () => {
    setLoading(true);
    const res = await api.get('/tasks');
    setTasks(res.data);
    setLoading(false);
  };

  useEffect(() => { loadTasks(); }, []);

  const statusTabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待接单' },
    { key: 'accepted', label: '已接单' },
    { key: 'in_progress', label: '进行中' },
    { key: 'completed', label: '已完成' },
  ];

  const [tab, setTab] = useState('all');
  const filtered = tab === 'all' ? tasks : tasks.filter(t => t.status === tab);

  const statusLabel: Record<string, { text: string; color: string }> = {
    pending: { text: '待接单', color: 'bg-yellow-100 text-yellow-700' },
    accepted: { text: '已接单', color: 'bg-blue-100 text-blue-700' },
    in_progress: { text: '进行中', color: 'bg-purple-100 text-purple-700' },
    completed: { text: '已完成', color: 'bg-green-100 text-green-700' },
    cancelled: { text: '已取消', color: 'bg-gray-100 text-gray-500' },
  };
  const serviceEmoji: Record<string, string> = { walk: '🐕', feed: '🐱', other: '🐾' };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">我的订单</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {statusTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition ${tab === t.key ? 'bg-amber-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-center text-gray-400 py-8">加载中...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-gray-500">暂无订单</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => (
            <div key={task.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{serviceEmoji[task.service_type]}</span>
                  <div>
                    <h3 className="font-medium text-gray-800">{task.title}</h3>
                    <p className="text-xs text-gray-400">{task.task_date} {task.task_time_start}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${statusLabel[task.status].color}`}>{statusLabel[task.status].text}</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                <span className="text-amber-600 font-bold">¥{task.reward}</span>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/task/${task.id}`)} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">详情</button>
                  {['pending', 'accepted', 'in_progress'].includes(task.status) && (
                    <button onClick={() => navigate(`/chat/${task.id}`)} className="px-3 py-1 bg-amber-50 text-amber-600 text-xs rounded-lg">聊天</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
