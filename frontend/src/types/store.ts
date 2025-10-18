interface userSchema {
  id: string;
  email: string;
  name: string;
  balance: string;
}

export interface formLogin {
  email: string;
  password: string;
}

export interface AuthStore {
  user: userSchema | null;
  token: string | null;
  actionSetUser: (user: userSchema) => void;
  actionSetToken: (token: string) => void;
  actionClearAuth: () => void;
  actionLogin: (form: formLogin) => void;
  actionLogout: () => void;
}
