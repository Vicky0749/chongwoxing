import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import type { Task } from '../types';

export default function TaskHall() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const navigate = useNavigate();

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks?mode=hall');
      setTasks(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const handleAccept = async (taskId: string) => {
    try {
      await api.post(`/tasks/${taskId}/accept`);
      alert('接单成功！');
      loadTasks();
    } catch (err: any) {
      alert(err.response?.data?.error || '接单失败');
    }
  };

  const serviceTypeLabel: Record<string, string> = { walk: '遛狗', feed: '上门喂猫', other: '其他' };
  const serviceTypeEmoji: Record<string, string> = { walk: '🐕', feed: '🐱', other: '🐾' };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">任务大厅</h2>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded-md text-sm transition ${viewMode === 'list' ? 'bg-white shadow text-amber-600 font-medium' : 'text-gray-500'}`}>列表</button>
          <button onClick={() => setViewMode('map')} className={`px-3 py-1 rounded-md text-sm transition ${viewMode === 'map' ? 'bg-white shadow text-amber-600 font-medium' : 'text-gray-500'}`}>地图</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-5xl mb-4">🗺️</p>
          <p className="text-gray-500">附近暂无任务</p>
          <p className="text-gray-400 text-sm mt-1">稍后再来看看吧</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{serviceTypeEmoji[task.service_type]}</span>
                  <h3 className="font-bold text-gray-800">{task.title}</h3>
                </div>
                <span className="text-amber-600 font-bold">¥{task.reward}</span>
              </div>
              <p className="text-gray-500 text-sm mb-2">📍 {task.location_name || '未指定地点'}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {task.pet_photo ? <img src={task.pet_photo} className="w-8 h-8 rounded-full object-cover" alt="" /> : <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">{serviceTypeEmoji[task.service_type]}</div>}
                  <div>
                    <p className="text-sm text-gray-700 font-medium">{task.pet_name}</p>
                    <p className="text-xs text-gray-400">发布者：{task.owner_nickname} ⭐{task.owner_rating?.toFixed(1) || '新'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/task/${task.id}`)} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg">详情</button>
                  <button onClick={() => handleAccept(task.id)} className="px-3 py-1 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition">抢单</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-gray-500 py-8">🗺️ 地图模式</p>
          <p className="text-gray-400 text-sm mb-4">高德地图需要申请Web API Key</p>
          <p className="text-gray-400 text-xs">当前 {tasks.length} 个任务显示在列表中</p>
          <div className="mt-4 space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="text-left p-2 bg-gray-50 rounded-lg text-sm">
                <span className="mr-2">{serviceTypeEmoji[task.service_type]}</span>
                <span className="font-medium">{task.title}</span>
                <span className="ml-2 text-amber-600">¥{task.reward}</span>
                <button onClick={() => handleAccept(task.id)} className="float-right px-2 py-0.5 bg-amber-500 text-white text-xs rounded">接单</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
