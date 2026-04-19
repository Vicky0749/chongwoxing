import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import type { Pet } from '../types';

export default function Pets() {
  const [pets, setPets] = useState<Pet[]>([]);

  const loadPets = async () => {
    const res = await api.get('/pets');
    setPets(res.data);
  };

  useEffect(() => { loadPets(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这只宠物吗？')) return;
    await api.delete(`/pets/${id}`);
    setPets(pets.filter(p => p.id !== id));
  };

  const speciesEmoji: Record<string, string> = { dog: '🐕', cat: '🐱', other: '🐾' };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">我的宠物</h2>
        <Link to="/pets/add" className="px-4 py-2 bg-amber-500 text-white text-sm rounded-lg font-medium hover:bg-amber-600 transition">
          + 添加宠物
        </Link>
      </div>
      {pets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-5xl mb-4">🐶</p>
          <p className="text-gray-500 mb-4">还没有添加宠物</p>
          <Link to="/pets/add" className="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium">添加第一只宠物</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pets.map(pet => (
            <div key={pet.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-3xl overflow-hidden">
                {pet.photo ? <img src={pet.photo} className="w-full h-full object-cover" alt={pet.name} /> : speciesEmoji[pet.species] || '🐾'}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-bold text-gray-800">{pet.name}</h3>
                  <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">{pet.species === 'dog' ? '狗' : pet.species === 'cat' ? '猫' : '其他'}</span>
                </div>
                <p className="text-gray-500 text-sm mt-1">{pet.breed || '未知品种'}</p>
                <p className="text-gray-400 text-xs mt-1">年龄：{pet.age}岁 | 体重：{pet.weight}kg</p>
                {pet.personality && <p className="text-gray-400 text-xs mt-1">性格：{pet.personality}</p>}
                <div className="flex gap-2 mt-2">
                  <Link to={`/pets/edit/${pet.id}`} className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">编辑</Link>
                  <button onClick={() => handleDelete(pet.id)} className="text-xs px-3 py-1 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition">删除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
