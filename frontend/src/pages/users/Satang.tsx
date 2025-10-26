import React, { useState, useEffect } from 'react';
import SatangTextMode from '../../components/user/SatangTextMode';
import SatangVoiceMode from '../../components/user/SatangVoiceMode';
import type { ChatMessage } from '../../types/satang';
import axios from '../../api/axios';

const Satang: React.FC = () => {
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const toggleVoiceMode = () => setIsVoiceMode((prev) => !prev);
  const toggleMic = () => setIsMicOn((prev) => !prev);

  const fetchSession = async (cursor?: number) => {
    try {
      const res = await axios.get('/satang/session', {
        params: { cursor, limit: 20 },
      });

      const data = res.data.data;

      const msgs: ChatMessage[] = data.messages.map((m: ChatMessage) => ({
        id: m.id,
        role: m.role === 'assistant' ? 'bot' : 'user',
        content: m.content,
        createdAt: m.createdAt,
      }));

      if (!cursor) {
        setMessages(msgs);
      } else {
        setMessages((prev) => [...msgs.filter((m) => !prev.find((p) => p.id === m.id)), ...prev]);
      }

      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.log('Failed to fetch session:', error);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const loadMore = async () => {
    if (!hasMore || !nextCursor) return;
    await fetchSession(nextCursor);
  };

  const sendMessage = async (msgText: string) => {
    if (!msgText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: msgText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setText('');
    setIsTyping(true);

    try {
      const res = await axios.post('/satang', { content: msgText });
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.message,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.log('Error sending message:', error);
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'เกิดข้อผิดพลาดในการตอบ AI',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
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
          loadMore={loadMore}
          hasMore={hasMore}
        />
      )}
    </div>
  );
};

export default Satang;
