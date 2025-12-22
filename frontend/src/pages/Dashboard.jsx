// src/pages/Dashboard.jsx
import React, { useContext } from 'react';
import { UserContext } from '../App';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser } = useContext(UserContext);
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const role = currentUser.role;
  const rolePath =
    role === 'admin' ? '/admin/dashboard' :
    role === 'student' ? '/student/dashboard' :
    role === 'teacher' ? '/teacher/dashboard' :
    role === 'accountant' ? '/accountant/dashboard' :
    role === 'cook' || role === 'cleaner' ? '/staff/dashboard' : '/login';

  return <Navigate to={rolePath} replace />;
};

export default Dashboard;
