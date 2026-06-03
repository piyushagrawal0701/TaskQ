import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { mongoUser, loading } = useAuth();

  if (loading) return <div>Loading access tokens...</div>;

  // If they aren't logged in, or their database role is not ADMIN, kick them out
  if (!mongoUser || mongoUser.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;