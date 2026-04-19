import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Pets from './pages/Pets';
import PetForm from './pages/PetForm';
import TaskHall from './pages/TaskHall';
import TaskForm from './pages/TaskForm';
import TaskDetail from './pages/TaskDetail';
import Orders from './pages/Orders';
import Chat from './pages/Chat';
import Conversations from './pages/Conversations';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="pets" element={<Pets />} />
        <Route path="pets/add" element={<PetForm />} />
        <Route path="pets/edit/:id" element={<PetForm />} />
        <Route path="task-hall" element={<TaskHall />} />
        <Route path="task/new" element={<TaskForm />} />
        <Route path="task/:id" element={<TaskDetail />} />
        <Route path="orders" element={<Orders />} />
        <Route path="conversations" element={<Conversations />} />
        <Route path="chat/:taskId" element={<Chat />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
