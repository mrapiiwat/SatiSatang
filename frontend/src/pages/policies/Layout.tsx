import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageWrapper from '../../components/PageWrapper';
import BackButton from '../../components/BackButton';

const LayoutPolicies: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  const getPageTitle = () => {
    if (pathname.includes('privacy-policy')) return t('privacy_policy', 'นโยบายความเป็นส่วนตัว');
    if (pathname.includes('terms-of-use')) return t('terms', 'ข้อตกลงการใช้งาน');
    return '';
  };

  return (
    <PageWrapper animation="fade">
      <div className="min-h-screen bg-white dark:bg-black-900 font-ibm text-black-900 dark:text-white">
        <nav
          className={`fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-black-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 h-20 px-6 flex items-center justify-between transition-all duration-500 ease-in-out ${
            isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between relative">
            <div className="flex items-center">
              <BackButton />
            </div>

            <div
              onClick={() => navigate('/user')}
              className="absolute left-1/2 -translate-x-1/2 w-9 h-9 cursor-pointer hover:opacity-80 transition-all hover:scale-105 active:scale-95"
            >
              <img className="w-full h-full dark:hidden" src="/SATISATANG.svg" alt="logo" />
              <img
                className="w-full h-full hidden dark:block"
                src="/SATISATANG1.svg"
                alt="logo dark"
              />
            </div>

            <div>{getPageTitle()}</div>
          </div>
        </nav>

        <main className="pt-28 pb-20 max-w-4xl mx-auto px-6">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </main>
      </div>
    </PageWrapper>
  );
};

export default LayoutPolicies;
