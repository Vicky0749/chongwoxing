import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();

  const ownerActions = [
    { icon: '🐶', label: '宠物管理', path: '/pets', desc: '添加、编辑宠物信息' },
    { icon: '➕', label: '发布任务', path: '/task/new', desc: '发布遛狗/喂猫任务' },
    { icon: '📋', label: '我的订单', path: '/orders', desc: '查看订单进度' },
    { icon: '💬', label: '消息中心', path: '/conversations', desc: '与代遛师沟通' },
  ];

  const walkerActions = [
    { icon: '🗺️', label: '任务大厅', path: '/task-hall', desc: '发现附近的代遛任务' },
    { icon: '📋', label: '我的订单', path: '/orders', desc: '管理接单任务' },
    { icon: '💬', label: '消息中心', path: '/conversations', desc: '与宠物主沟通' },
    { icon: '💰', label: '我的钱包', path: '/profile', desc: `余额 ¥${user?.balance?.toFixed(2) ?? '0.00'}` },
  ];

  const actions = user?.role === 'walker' ? walkerActions : ownerActions;

  return (
    <div className="p-4">
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl p-5 mb-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center text-2xl">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" /> : '🐾'}
          </div>
          <div>
            <h2 className="text-lg font-bold">{user?.nickname}</h2>
            <p className="text-amber-100 text-sm">{user?.role === 'owner' ? '🐶 宠物主' : '🚶 代遛师'}</p>
          </div>
        </div>
        <div className="flex gap-6 mt-4">
          <div>
            <p className="text-2xl font-bold">{user?.rating?.toFixed(1) || '0.0'}</p>
            <p className="text-amber-100 text-xs">评分</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{user?.order_count || 0}</p>
            <p className="text-amber-100 text-xs">完成订单</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{user?.review_count || 0}</p>
            <p className="text-amber-100 text-xs">评价数</p>
          </div>
        </div>
      </div>

      <h3 className="text-gray-700 font-semibold mb-3 px-1">快捷操作</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map(action => (
          <Link
            key={action.path}
            to={action.path}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col gap-2"
          >
            <span className="text-2xl">{action.icon}</span>
            <div>
              <p className="font-medium text-gray-800 text-sm">{action.label}</p>
              <p className="text-gray-400 text-xs mt-0.5">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
