import { useEffect } from 'react';
import useSettingStore from '../store/settingStore';

export function useTheme() {
  const theme = useSettingStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;

    const applyDark = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (theme === 'dark') {
      applyDark(true);
    } else if (theme === 'light') {
      applyDark(false);
    } else {
      // 'system' — follow OS preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyDark(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => applyDark(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);
}
