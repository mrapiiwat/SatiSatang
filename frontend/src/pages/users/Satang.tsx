import React, { useState, useEffect, useCallback, useRef } from 'react';
import SatangTextMode from '../../components/user/satang/SatangTextMode';
import type { ChatMessage } from '../../interface/satang';
import axios from '../../api/axios';
import { fetchWithAuth } from '../../api/fetch';
import { useTranslation } from 'react-i18next';

const Satang: React.FC = () => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const isLoadingRef = useRef(false);

  const fetchSession = useCallback(async (cursor?: number) => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoadingHistory(true);

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
        setMessages((prev) => {
          const newMsgs = msgs.filter((m) => !prev.find((p) => p.id === m.id));
          return [...newMsgs, ...prev];
        });
      }

      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.log('Failed to fetch session:', error);
    } finally {
      isLoadingRef.current = false;
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const loadMore = async () => {
    if (!hasMore || !nextCursor || isLoadingRef.current) return;
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
      const response = await fetchWithAuth('/api/satang', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: msgText }),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let partialMessage = '';
      let firstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        partialMessage += chunk;

        if (firstChunk && chunk.trim() !== '') {
          setIsTyping(false);
          firstChunk = false;
        }

        setMessages((prev) => {
          const existingBot = prev.find(
            (m) => m.role === 'assistant' && m.id === userMessage.id + 1,
          );

          if (existingBot) {
            return prev.map((m) =>
              m.id === existingBot.id ? { ...m, content: partialMessage } : m,
            );
          } else {
            return [
              ...prev,
              {
                id: userMessage.id + 1,
                role: 'assistant',
                content: chunk,
                createdAt: new Date().toISOString(),
              },
            ];
          }
        });
      }

      if (firstChunk) setIsTyping(false);
    } catch (error) {
      console.error('Error streaming message:', error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: t('ai_error_response', 'เกิดข้อผิดพลาดในการตอบ AI'),
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  return (
    <div>
      <SatangTextMode
        text={text}
        setText={setText}
        sendMessage={sendMessage}
        messages={messages}
        isTyping={isTyping}
        loadMore={loadMore}
        hasMore={hasMore}
        isLoadingHistory={isLoadingHistory}
      />
    </div>
  );
};

export default Satang;
