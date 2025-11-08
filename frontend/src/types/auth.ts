import React from 'react';

export interface InputFieldProps {
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  label: string;
}

export interface OAuthButtonProps {
  onClick: () => void;
  label: string;
  logo: string;
}

export interface LoginForm {
  email: string;
  password: string;
}
