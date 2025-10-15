import React, { useState, useEffect } from 'react';
import SatangTextMode from '../../components/user/SatangTextMode';
import SatangVoiceMode from '../../components/user/SatangVoiceMode';
import type { ChatMessage } from '../../types/satang';
import axios from "../../api/axios"

const Satang: React.FC = () => {
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);

  const toggleVoiceMode = () => setIsVoiceMode(prev => !prev);
  const toggleMic = () => setIsMicOn(prev => !prev);

  // ดึง session ล่าสุดตอน mount
  useEffect(() => {
    const fetchLatestSession = async () => {
      try {
        const res = await axios.get("/satang/session"); // backend route
        if (res.data?.data?.messages) {
          setMessages(res.data.data.messages.map((m: any) => ({
            id: m.id,
            role: m.role === 'assistant' ? 'bot' : 'user',
            content: m.content,
            createdAt: m.createdAt,
          })));
        }
      } catch (error) {
        console.log("Failed to fetch latest session:", error);
      }
    };
    fetchLatestSession();
  }, []);

  const sendMessage = async (msgText: string) => {
    if (!msgText.trim()) return;

    const userMessage: ChatMessage = { 
      id: Date.now(), 
      role: 'user', 
      content: msgText, 
      createdAt: new Date().toISOString() 
    };
    setMessages(prev => [...prev, userMessage]);
    setText('');
    setIsTyping(true);

    try {
      const res = await axios.post("/satang", { content: msgText });
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'bot',
        content: res.data.message,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.log("Error sending message:", error);
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'bot',
        content: "เกิดข้อผิดพลาดในการตอบ AI",
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
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
