import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

interface RedirectIfAuthProps {
  element: React.ReactElement;
}

const RedirectIfAuth: React.FC<RedirectIfAuthProps> = ({ element }) => {
  const user = useAuthStore((state) => state.user);

  if (user) {
    return <Navigate to="/user" replace />;
  }

  return element;
};

export default RedirectIfAuth;
