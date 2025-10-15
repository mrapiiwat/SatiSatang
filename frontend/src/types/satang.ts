export interface ChatMessage {
    id: number;
    role: 'user' | 'bot';
    content: string;
    createdAt: string;
}

export interface SatangTextModeProps {
    toggleVoiceMode: () => void;
    text: string;
    setText: React.Dispatch<React.SetStateAction<string>>;
    sendMessage: (text: string) => void;
    messages: ChatMessage[];
    isTyping: boolean;

}
export interface SatangVoiceModeProps {
    toggleMic: () => void;
    toggleVoiceMode: () => void;
    isMicOn: boolean;
}

