import React from 'react';

export interface ImageProps {
  src: string;
  alt: string;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

type AnimationType =
  | 'fade'
  | 'fade-slide'
  | 'scale-fade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'rotate'
  | 'flip';

export interface PageWrapperProps {
  children: React.ReactNode;
  animation?: AnimationType;
  duration?: number;
}

export interface SubmitButtonProps {
  isLoading: boolean;
  text: string;
}

export interface MonthHeaderProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number, year: number) => void;
}

export type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export interface AlertProps {
  title?: string;
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
  confirmText?: string;
}
