
import React from 'react';
import { useApp } from '../../context/AppContext';
import Login from './Login';
import Dashboard from './Dashboard';

const AdminPanel: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Login />;
  }

  return <Dashboard />;
};

export default AdminPanel;
