import React, { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectRoute from './ProtectRoute';
import RedirectIfAuth from './RedirectIfAuth';
import ConsentInterceptor from '../components/ConsentInterceptor';

const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));
const LayoutPolicies = lazy(() => import('../pages/policies/Layout'));
const AuthCallback = lazy(() => import('../pages/auth/AuthCallback'));
const Categories = lazy(() => import('../pages/users/Categories'));
const Privacy = lazy(() => import('../pages/policies/Privacy'));
const LayoutUser = lazy(() => import('../pages/users/Layout'));
const Feedback = lazy(() => import('../pages/users/Feedback'));
const Recovery = lazy(() => import('../pages/auth/Recovery'));
const NotFound = lazy(() => import('../pages/404/NotFound'));
const Account = lazy(() => import('../pages/users/Account'));
const Summary = lazy(() => import('../pages/users/Summary'));
const Setting = lazy(() => import('../pages/users/Setting'));
const HomeUsers = lazy(() => import('../pages/users/Home'));
const Terms = lazy(() => import('../pages/policies/Terms'));
const Satang = lazy(() => import('../pages/users/Satang'));
const Verify = lazy(() => import('../pages/auth/Verify'));
const Login = lazy(() => import('../pages/auth/Login'));
const Layout = lazy(() => import('../pages/Layout'));
const Home = lazy(() => import('../pages/Home'));

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
    element: (
      <ProtectRoute
        element={
          <ConsentInterceptor>
            <LayoutUser />
          </ConsentInterceptor>
        }
      />
    ),
    children: [
      { index: true, element: <HomeUsers /> },
      { path: 'account', element: <Account /> },
      { path: 'categories', element: <Categories /> },
      { path: 'satang', element: <Satang /> },
      { path: 'summary', element: <Summary /> },
      { path: 'feedback', element: <Feedback /> },
      { path: 'setting', element: <Setting /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/policies',
    element: <LayoutPolicies />,
    children: [
      { path: 'terms-of-use', element: <Terms /> },
      { path: 'privacy-policy', element: <Privacy /> },
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
