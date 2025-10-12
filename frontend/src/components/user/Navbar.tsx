import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) return;
      if (window.scrollY > lastScrollY && window.scrollY > 50) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full flex justify-between items-center p-6 z-50 transition-all duration-300
          ${isOpen ? '' : 'bg-white'}
          ${showNavbar ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
        <img
          onClick={() => navigate('/user')}
          className="w-8 h-8 relative z-[60] transition-all duration-300"
          src={isOpen ? '/SATISATANG1.svg' : '/SATISATANG.svg'}
          alt="logo app"
        />
        <button
          className={`flex flex-col justify-center items-center w-6 h-6 relative z-[60] transition-opacity duration-300
            ${isOpen ? 'md:opacity-0 md:pointer-events-none' : 'md:opacity-100'}
          `}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span
            className={`block absolute h-0.5 w-6 transform transition duration-300 ease-in-out
              ${isOpen ? 'rotate-45 top-3 bg-white' : 'top-2 bg-black-900'}
            `}
          ></span>
          <span
            className={`block absolute h-0.5 w-6 transform transition duration-300 ease-in-out
              ${isOpen ? '-rotate-45 top-3 bg-white' : 'top-5 bg-black-900'}
            `}
          ></span>
        </button>
      </nav>
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default Navbar;
