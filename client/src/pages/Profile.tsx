import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import type { Review } from '../types';

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState({
    nickname: user?.nickname || '',
    real_name: user?.real_name || '',
    id_card: user?.id_card || '',
    bio: user?.bio || '',
    service_radius: user?.service_radius || 5,
    service_start_time: user?.service_start_time || '08:00',
    service_end_time: user?.service_end_time || '22:00',
  });

  useEffect(() => {
    if (user?.id) {
      api.get(`/users/${user.id}/reviews`).then(res => setReviews(res.data));
    }
  }, [user?.id]);

  const handleSave = async () => {
    await api.put('/users/profile', form);
    await refreshUser();
    setEditing(false);
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-4xl">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" /> : '🐾'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user?.nickname}</h2>
            <p className="text-gray-500 text-sm">{user?.phone}</p>
            <p className="text-amber-600 text-sm font-medium">{user?.role === 'owner' ? '🐶 宠物主' : '🚶 代遛师'}</p>
          </div>
        </div>
        <div className="flex gap-6 mb-4">
          <div className="text-center">
            <p className="text-xl font-bold text-amber-600">{user?.rating?.toFixed(1) || '0.0'} ⭐</p>
            <p className="text-xs text-gray-500">评分</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-amber-600">{user?.order_count || 0}</p>
            <p className="text-xs text-gray-500">完成订单</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-amber-600">¥{user?.balance?.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-gray-500">余额</p>
          </div>
        </div>
        <button onClick={() => setEditing(!editing)} className="w-full py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition">
          {editing ? '取消编辑' : '编辑资料'}
        </button>
      </div>

      {editing && (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4 space-y-3">
          <h3 className="font-semibold text-gray-700 mb-2">编辑资料</h3>
          <input value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} className="w-full px-4 py-2 border rounded-xl" placeholder="昵称" />
          <input value={form.real_name} onChange={e => setForm({ ...form, real_name: e.target.value })} className="w-full px-4 py-2 border rounded-xl" placeholder="真实姓名（实名认证）" />
          <input value={form.id_card} onChange={e => setForm({ ...form, id_card: e.target.value })} className="w-full px-4 py-2 border rounded-xl" placeholder="身份证号（实名认证）" />
          <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="w-full px-4 py-2 border rounded-xl" rows={3} placeholder="个人简介" />
          {user?.role === 'walker' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <input type="time" value={form.service_start_time} onChange={e => setForm({ ...form, service_start_time: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
                <input type="time" value={form.service_end_time} onChange={e => setForm({ ...form, service_end_time: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="text-sm text-gray-600">服务半径：{form.service_radius} km</label>
                <input type="range" min="1" max="20" value={form.service_radius} onChange={e => setForm({ ...form, service_radius: Number(e.target.value) })} className="w-full accent-amber-500" />
              </div>
            </>
          )}
          <button onClick={handleSave} className="w-full py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition">保存</button>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-3">收到的评价</h3>
        {reviews.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">暂无评价</p> : reviews.map(r => (
          <div key={r.id} className="border-b border-gray-100 py-3 last:border-0">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-800">{r.reviewer_nickname}</p>
              <p className="text-amber-500 text-sm">{'⭐'.repeat(r.rating)}</p>
            </div>
            <p className="text-gray-500 text-sm mt-1">{r.comment || '暂无评价'}</p>
          </div>
        ))}
      </div>

      <button onClick={logout} className="w-full mt-4 py-3 border border-red-300 text-red-500 rounded-xl font-medium hover:bg-red-50 transition">
        退出登录
      </button>
    </div>
  );
}
