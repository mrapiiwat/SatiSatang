import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useSettingStore from './store/settingStore';
import AppRoutes from './routes/AppRoutes';
import InstallPWA from './components/InstallPWA';

export default function App() {
  const { i18n } = useTranslation();
  const appLanguage = useSettingStore((state) => state.appLanguage);

  useEffect(() => {
    if (appLanguage && i18n.language !== appLanguage) {
      i18n.changeLanguage(appLanguage);
    }
  }, [appLanguage, i18n]);

  return (
    <>
      <InstallPWA />
      <AppRoutes />
    </>
  );
}
