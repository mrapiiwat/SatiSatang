import React from 'react';

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface SatangTextModeProps {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (text: string) => void;
  messages: ChatMessage[];
  isTyping: boolean;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isLoadingHistory: boolean;
}

export interface SatangVoiceModeProps {
  toggleMic: () => void;
  toggleVoiceMode: () => void;
  isMicOn: boolean;
}
