import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

export default function PetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', species: 'dog', breed: '', age: '', weight: '',
    vaccines: [] as string[], personality: '', photo: ''
  });
  const [vaccineInput, setVaccineInput] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get('/pets').then(res => {
        const pet = res.data.find((p: any) => p.id === id);
        if (pet) {
          setForm({ name: pet.name, species: pet.species, breed: pet.breed, age: pet.age, weight: pet.weight, vaccines: pet.vaccines || [], personality: pet.personality, photo: pet.photo });
          if (pet.photo) setPhotoPreview(pet.photo);
        }
      });
    }
  }, [id, isEdit]);

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

  const addVaccine = () => {
    if (vaccineInput.trim()) {
      setForm({ ...form, vaccines: [...form.vaccines, vaccineInput.trim()] });
      setVaccineInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, age: Number(form.age), weight: Number(form.weight) };
    if (isEdit) await api.put(`/pets/${id}`, payload);
    else await api.post('/pets', payload);
    navigate('/pets');
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">{isEdit ? '编辑宠物' : '添加宠物'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">宠物名字 *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border rounded-xl" placeholder="例如：豆豆" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">种类 *</label>
            <div className="grid grid-cols-3 gap-2">
              {[['dog', '🐕 狗'], ['cat', '🐱 猫'], ['other', '🐾 其他']].map(([v, label]) => (
                <button key={v} type="button" onClick={() => setForm({ ...form, species: v })} className={`py-2 rounded-xl border-2 text-sm font-medium transition ${form.species === v ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600'}`}>{label}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">品种</label>
              <input value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} className="w-full px-4 py-2 border rounded-xl" placeholder="例如：金毛" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">年龄（岁）</label>
              <input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} className="w-full px-4 py-2 border rounded-xl" placeholder="2" min="0" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">体重（kg）</label>
            <input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} className="w-full px-4 py-2 border rounded-xl" placeholder="10" min="0" step="0.1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性格描述</label>
            <textarea value={form.personality} onChange={e => setForm({ ...form, personality: e.target.value })} className="w-full px-4 py-2 border rounded-xl" rows={2} placeholder="例如：活泼好动，对人友好" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">疫苗情况</label>
            <div className="flex gap-2">
              <input value={vaccineInput} onChange={e => setVaccineInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addVaccine())} className="flex-1 px-4 py-2 border rounded-xl" placeholder="输入疫苗名称后回车添加" />
              <button type="button" onClick={addVaccine} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm">添加</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.vaccines.map(v => (
                <span key={v} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                  {v} <button type="button" onClick={() => setForm({ ...form, vaccines: form.vaccines.filter(x => x !== v) })}>×</button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">宠物照片</label>
            <input type="file" accept="image/*" onChange={handlePhoto} className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-amber-50 file:text-amber-700 file:font-medium cursor-pointer" />
            {photoPreview && <img src={photoPreview} className="w-24 h-24 object-cover rounded-xl mt-2" alt="preview" />}
          </div>
        </div>
        <button type="submit" className="w-full py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition">
          {isEdit ? '保存修改' : '添加宠物'}
        </button>
      </form>
    </div>
  );
}
