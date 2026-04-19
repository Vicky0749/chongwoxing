import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const ownerTabs = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/pets', label: '宠物', icon: '🐶' },
    { path: '/task/new', label: '发任务', icon: '➕' },
    { path: '/orders', label: '订单', icon: '📋' },
    { path: '/conversations', label: '消息', icon: '💬' },
    { path: '/profile', label: '我的', icon: '👤' },
  ];

  const walkerTabs = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/task-hall', label: '任务大厅', icon: '🗺️' },
    { path: '/orders', label: '订单', icon: '📋' },
    { path: '/conversations', label: '消息', icon: '💬' },
    { path: '/profile', label: '我的', icon: '👤' },
  ];

  const tabs = user?.role === 'walker' ? walkerTabs : ownerTabs;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl">
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 flex z-50">
        {tabs.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                isActive ? 'text-amber-500' : 'text-gray-400'
              }`
            }
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="mt-0.5">{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
