import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import type { Pet } from '../types';

export default function TaskForm() {
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [photoPreview, setPhotoPreview] = useState('');
  const [form, setForm] = useState({
    pet_id: '', service_type: 'walk', title: '', description: '',
    location_name: '上海市（默认位置）', latitude: '31.2304', longitude: '121.4737',
    reward: '', task_date: '', task_time_start: '09:00', task_time_end: '12:00', photo: ''
  });

  useEffect(() => {
    api.get('/pets').then(res => {
      setPets(res.data);
      if (res.data.length > 0) setForm(f => ({ ...f, pet_id: res.data[0].id }));
    });
  }, []);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (r) => {
      const base64 = r.target?.result as string;
      setPhotoPreview(base64);
      setForm({ ...form, photo: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pet_id) return alert('请选择宠物');
    if (!form.task_date) return alert('请选择日期');
    try {
      await api.post('/tasks', { ...form, latitude: Number(form.latitude), longitude: Number(form.longitude), reward: Number(form.reward) });
      navigate('/orders');
    } catch (err: any) {
      alert(err.response?.data?.error || '发布失败');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">发布任务</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">选择宠物 *</label>
            {pets.length === 0 ? (
              <p className="text-gray-400 text-sm">请先添加宠物 <a href="/pets/add" className="text-amber-600">去添加</a></p>
            ) : (
              <select value={form.pet_id} onChange={e => setForm({ ...form, pet_id: e.target.value })} className="w-full px-4 py-2 border rounded-xl bg-white">
                {pets.map(p => <option key={p.id} value={p.id}>{p.name}（{p.species === 'dog' ? '狗' : p.species === 'cat' ? '猫' : '其他'}）</option>)}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">服务类型 *</label>
            <div className="grid grid-cols-3 gap-2">
              {[['walk', '🐕 遛狗'], ['feed', '🐱 上门喂猫'], ['other', '🐾 其他']].map(([v, label]) => (
                <button key={v} type="button" onClick={() => setForm({ ...form, service_type: v })} className={`py-2 rounded-xl border-2 text-sm font-medium transition ${form.service_type === v ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600'}`}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">任务标题 *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border rounded-xl" placeholder="例如：帮遛金毛豆豆30分钟" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border rounded-xl" rows={3} placeholder="描述任务要求，例如：需要自带牵引绳，狗狗有点怕生..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">地点名称</label>
            <input value={form.location_name} onChange={e => setForm({ ...form, location_name: e.target.value })} className="w-full px-4 py-2 border rounded-xl" placeholder="例如：上海市浦东新区陆家嘴" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">纬度</label>
              <input type="number" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} className="w-full px-4 py-2 border rounded-xl" step="0.0001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">经度</label>
              <input type="number" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} className="w-full px-4 py-2 border rounded-xl" step="0.0001" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">悬赏金额（元）</label>
            <input type="number" value={form.reward} onChange={e => setForm({ ...form, reward: e.target.value })} className="w-full px-4 py-2 border rounded-xl" placeholder="例如：30" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">服务日期 *</label>
            <input type="date" value={form.task_date} onChange={e => setForm({ ...form, task_date: e.target.value })} className="w-full px-4 py-2 border rounded-xl" min={new Date().toISOString().split('T')[0]} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
              <input type="time" value={form.task_time_start} onChange={e => setForm({ ...form, task_time_start: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
              <input type="time" value={form.task_time_end} onChange={e => setForm({ ...form, task_time_end: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">宠物照片（可选）</label>
            <input type="file" accept="image/*" onChange={handlePhoto} className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-amber-50 file:text-amber-700 file:font-medium cursor-pointer" />
            {photoPreview && <img src={photoPreview} className="w-24 h-24 object-cover rounded-xl mt-2" alt="preview" />}
          </div>
        </div>
        <button type="submit" className="w-full py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition">发布任务</button>
      </form>
    </div>
  );
}
