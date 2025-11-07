import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Verify from '../pages/auth/Verify';
import HomeUsers from '../pages/users/Home';
import ProtectRoute from './ProtectRoute';
import LayoutUser from '../pages/users/Layout';
import AuthCallback from '../pages/auth/AuthCallback';
import RedirectIfAuth from './RedirectIfAuth';
import Layout from '../pages/Layout';
import NotFound from '../pages/404/NotFound';
import Account from '../pages/users/Account';
import Categories from '../pages/users/Categories';
import Satang from '../pages/users/Satang';
import Summary from '../pages/users/Summary';
import Stock, { StockDetail } from '../pages/users/Stock';
import ResetPassword from '../pages/auth/ResetPassword';
import Recovery from '../pages/auth/Recovery';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RedirectIfAuth element={<Layout />} />,
    children: [
      { index: true, element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/verify', element: <Verify /> },
      { path: '/auth/callback', element: <AuthCallback /> },
      { path: '/reset-password', element: <ResetPassword /> },
      { path: '/recovery', element: <Recovery /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/user',
    element: <ProtectRoute element={<LayoutUser />} />,
    children: [
      { index: true, element: <HomeUsers /> },
      { path: 'account', element: <Account /> },
      { path: 'categories', element: <Categories /> },
      { path: 'satang', element: <Satang /> },
      { path: 'summary', element: <Summary /> },
      { path: 'stock', element: <Stock /> },
      { path: 'stock-detail', element: <StockDetail /> },
      { path: '*', element: <NotFound /> },
    ],
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
