export interface OAuthAccount {
  id: string;
  provider: string;
  providerUserId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string | null;
}

export interface userSchema {
  id: string;
  email: string;
  name: string;
  oauthAccounts?: OAuthAccount[];
  currentLogin: string;
}

export interface formLogin {
  email: string;
  password: string;
}

export interface AuthStore {
  user: userSchema | null;
  token: string | null;
  isConsentAccepted: boolean;
  actionSetUser: (user: userSchema | null) => void;
  actionSetToken: (token: string) => void;
  actionClearAuth: () => void;
  actionLogin: (form: formLogin) => void;
  actionLogout: () => void;
  actionSetConsent: (status: boolean) => void;
}

export interface SettingState {
  appLanguage: 'th' | 'en';
  aiLanguage: 'th' | 'en';
  theme: 'light' | 'dark' | 'system';
  isNotificationEnabled: boolean;
  budgetStartDate: number;
  userId: string | null;
  lastSyncedToken: string | null;
}

export interface SettingStore extends SettingState {
  actionSetSettings: (settings: SettingState) => void;
  actionUpdateSetting: (data: Partial<SettingState>) => Promise<void>;
  actionClearSettings: () => void;
  actionSyncFCMToken: () => void;
}
export interface LoadingState {
  loadingCount: number;
  startLoading: () => void;
  stopLoading: () => void;
}
