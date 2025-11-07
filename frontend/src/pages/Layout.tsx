import React from 'react';
import { Outlet } from 'react-router-dom';
import ToastAlert from '../components/user/ToastAlert';

const Layout: React.FC = () => {
  return (
    <>
      <ToastAlert />
      <Outlet />
    </>
  );
};

export default Layout;
