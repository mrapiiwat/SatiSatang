import React, { useState } from 'react';
import SatangTextMode from '../../components/user/SatangTextMode';
import SatangVoiceMode from '../../components/user/SatangVoiceMode';
import type { ChatMessage } from '../../types/satang';

const Satang: React.FC = () => {
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);

  const toggleVoiceMode = () => setIsVoiceMode(prev => !prev);
  const toggleMic = () => setIsMicOn(prev => !prev);

  const sendMessage = (msgText: string) => {
    if (!msgText.trim()) return;

    const userMessage: ChatMessage = { id: Date.now(), role: 'user', content: msgText, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setText('');
    setIsTyping(true);

    setTimeout(() => {
      const botMessage: ChatMessage = { id: Date.now() + 1, role: 'bot', content: `AI ตอบ: ${msgText}`, createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div>
      {isVoiceMode ? (
        <SatangVoiceMode
          toggleMic={toggleMic}
          isMicOn={isMicOn}
          toggleVoiceMode={toggleVoiceMode}
        />
      ) : (
        <SatangTextMode
          toggleVoiceMode={toggleVoiceMode}
          text={text}
          setText={setText}
          sendMessage={sendMessage}
          messages={messages}
          isTyping={isTyping}
        />
      )}
    </div>
  );
};

export default Satang;
