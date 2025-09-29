import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Verify from '../pages/auth/Verify';
import HomeUsers from '../pages/users/Home';
import ProtectRoute from './ProtectRoute';
import Layout from '../pages/users/Layout';
import AuthCallback from '../pages/auth/AuthCallback';
import RedirectIfAuth from './RedirectIfAuth';

const router = createBrowserRouter([
  { path: '/', element: <RedirectIfAuth element={<Home />} /> },
  { path: '/login', element: <RedirectIfAuth element={<Login />} /> },
  { path: '/verify', element: <RedirectIfAuth element={<Verify />} /> },
  { path: '/auth/callback', element: <RedirectIfAuth element={<AuthCallback />} /> },
  {
    path: '/user',
    element: <ProtectRoute element={<Layout />} />,
    children: [{ index: true, element: <HomeUsers /> }],
  },
]);

const AppRoutes: React.FC = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default AppRoutes;
