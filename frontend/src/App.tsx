import { useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import useSettingStore from './store/settingStore';
import AppRoutes from './routes/AppRoutes';
import InstallPWA from './components/InstallPWA';
import { useTheme } from './hooks/useTheme';
import Loading from './components/Loading';
import useLoadingStore from './store/loadingStore';

export default function App() {
  const { i18n } = useTranslation();
  const appLanguage = useSettingStore((state) => state.appLanguage);
  const loadingCount = useLoadingStore((state) => state.loadingCount);
  const isLoading = loadingCount > 0;
  useTheme();

  useEffect(() => {
    if (appLanguage && i18n.language !== appLanguage) {
      i18n.changeLanguage(appLanguage);
    }
  }, [appLanguage, i18n]);

  return (
    <>
      <InstallPWA />
      {isLoading && <Loading />}
      <Suspense fallback={<Loading />}>
        <AppRoutes />
      </Suspense>
    </>
  );
}
