import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Conversations() {
  const [convs, setConvs] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/messages/conversations').then(res => setConvs(res.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">消息中心</h2>
      {convs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-5xl mb-4">💬</p>
          <p className="text-gray-500">暂无消息</p>
          <p className="text-gray-400 text-sm mt-1">完成订单后才能聊天</p>
        </div>
      ) : (
        <div className="space-y-2">
          {convs.map(c => (
            <div key={c.task_id} onClick={() => navigate(`/chat/${c.task_id}`)} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-xl">
                {c.other_role === 'walker' ? '🚶' : '🐶'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="font-medium text-gray-800 truncate">{c.other_nickname || '未知用户'}</p>
                  <p className="text-xs text-gray-400">{c.last_time ? new Date(c.last_time).toLocaleDateString() : ''}</p>
                </div>
                <p className="text-sm text-gray-500 truncate mt-0.5">{c.last_message || '暂无消息'}</p>
                <p className="text-xs text-amber-600 mt-0.5">{c.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
