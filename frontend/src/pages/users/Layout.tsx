import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/user/Navbar';
import ToastAlert from '../../components/ToastAlert';

const Layout: React.FC = () => {
  return (
    <>
      <Navbar />
      <ToastAlert />
      <div className="pt-20">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
