import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { getStorageItem, setStorageItem, StorageKeys } from '@/lib/storage';

interface AppContextType {
  locale: string;
  setLocale: (locale: string) => void;
  isRTL: boolean;
  setIsRTL: (rtl: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(() => getStorageItem(StorageKeys.LOCALE, 'fr-MA'));
  const [isRTL, setIsRTLState] = useState(() => getStorageItem(StorageKeys.RTL, false));

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [locale, isRTL]);

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    setStorageItem(StorageKeys.LOCALE, newLocale);
  };

  const setIsRTL = (rtl: boolean) => {
    setIsRTLState(rtl);
    setStorageItem(StorageKeys.RTL, rtl);
  };

  return (
    <AppContext.Provider value={{ locale, setLocale, isRTL, setIsRTL }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
