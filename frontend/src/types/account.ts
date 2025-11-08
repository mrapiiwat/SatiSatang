export interface PasswordChangeFormProps {
  oldPassword: string;
  setOldPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  passwordError: string;
  handlePasswordChange: () => void;
  cancel: () => void;
}

export interface IconSelectorProps {
  selectedIconId: string;
  selectedIconUrl?: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export interface Icon {
  id: number;
  url: string;
  description: string;
}