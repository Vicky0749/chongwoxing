import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState<'owner' | 'walker'>('owner');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(phone, password, nickname, role);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '注册失败');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-6xl mb-4">🐾</div>
        <h1 className="text-2xl font-bold text-amber-600 mb-8">注册宠我行</h1>
        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
              placeholder="请输入手机号"
              maxLength={11}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
              placeholder="请输入密码"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
              placeholder="请输入昵称"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">选择角色</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`py-3 px-4 rounded-xl border-2 font-medium transition ${
                  role === 'owner'
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                🐶 宠物主
              </button>
              <button
                type="button"
                onClick={() => setRole('walker')}
                className={`py-3 px-4 rounded-xl border-2 font-medium transition ${
                  role === 'walker'
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                🚶 代遛师
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition shadow-lg shadow-amber-200"
          >
            注册
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-500">
          已有账号？<Link to="/login" className="text-amber-600 font-medium">立即登录</Link>
        </p>
      </div>
    </div>
  );
}
