import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(phone, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '登录失败');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-6xl mb-4">🐾</div>
        <h1 className="text-2xl font-bold text-amber-600 mb-2">宠我行</h1>
        <p className="text-gray-500 mb-8 text-sm">让宠物生活更美好</p>
        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition"
              placeholder="请输入密码"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition shadow-lg shadow-amber-200"
          >
            登录
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-500">
          还没有账号？<Link to="/register" className="text-amber-600 font-medium">立即注册</Link>
        </p>
      </div>
    </div>
  );
}
