import React from 'react';
import { Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Layout = () => {
  const actionLogout = useAuthStore((state) => state.actionLogout);
  return (
    <>
      <div>Layout</div>
      <button className="bg-red-400" onClick={actionLogout}>
        Logout
      </button>
      <Outlet />
    </>
  );
};

export default Layout;
