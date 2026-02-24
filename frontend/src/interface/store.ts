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
  balance: string;
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
  actionSetUser: (user: userSchema | null) => void;
  actionSetToken: (token: string) => void;
  actionClearAuth: () => void;
  actionLogin: (form: formLogin) => void;
  actionLogout: () => void;
}
