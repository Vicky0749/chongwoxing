import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import type { Message } from '../types';

export default function Chat() {
  const { taskId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [task, setTask] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    const res = await api.get(`/messages/task/${taskId}`);
    setMessages(res.data);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadTask = async () => {
    const res = await api.get(`/tasks/${taskId}`);
    setTask(res.data);
  };

  useEffect(() => {
    loadMessages();
    loadTask();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [taskId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    await api.post('/messages', { task_id: taskId, content: input.trim() });
    setInput('');
    loadMessages();
  };

  const other = task ? (user?.id === task.owner_id ? task.walker_nickname : task.owner_nickname) : '';

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <button onClick={() => history.back()} className="text-gray-500">←</button>
        <div>
          <p className="font-medium text-gray-800">{other || '聊天'}</p>
          {task && <p className="text-xs text-gray-400">{task.title}</p>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-8">暂无消息，开始聊天吧！</p>
        ) : messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.sender_id === user?.id ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
              <p className="text-sm">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-amber-200' : 'text-gray-400'}`}>{new Date(msg.created_at).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="bg-white border-t border-gray-200 p-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          className="flex-1 px-4 py-2 border rounded-full bg-gray-50 outline-none"
          placeholder="输入消息..."
        />
        <button onClick={sendMessage} className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center hover:bg-amber-600 transition">→</button>
      </div>
    </div>
  );
}
