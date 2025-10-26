import React, { useEffect, useRef } from 'react';
import { GoArrowUp } from 'react-icons/go';
import Face from '../../assets/Page-1.svg';
import type { SatangTextModeProps } from '../../types/satang';
import TypingIndicator from './TypingIndicator';

const SatangTextMode: React.FC<SatangTextModeProps> = ({
  toggleVoiceMode,
  text,
  setText,
  sendMessage,
  messages,
  isTyping,
  loadMore,
  hasMore,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const isUserScrolledRef = useRef(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage(text);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
      isUserScrolledRef.current = !nearBottom;
    };

    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prevLength = prevMessagesLengthRef.current;
    const newMessagesCount = messages.length - prevLength;

    if (newMessagesCount > 0 && !isUserScrolledRef.current) {
      container.scrollTop = container.scrollHeight;
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = async () => {
      if (container.scrollTop < 50 && hasMore) {
        const prevScrollBottom = container.scrollHeight - container.scrollTop;
        await loadMore();
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight - prevScrollBottom;
        });
      }
    };

    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, [loadMore, hasMore]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between px-6 py-6">
      <div
        ref={containerRef}
        className="border-[1px] border-black-600 rounded-xl flex-1 w-full mb-5 overflow-y-auto p-2 max-h-[75vh] scrollbar-none"
      >
        {hasMore && (
          <div className="text-center text-gray-500 text-sm mb-2">
            เลื่อนขึ้นเพื่อโหลดเพิ่มเติม...
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 my-1 rounded-xl w-fit max-w-[70%] break-words whitespace-normal ${
              msg.role === 'user' ? 'bg-blue-200 ml-auto' : 'bg-gray-200'
            }`}
          >
            {msg.content}
          </div>
        ))}

        {isTyping && (
          <div className="ml-2">
            <TypingIndicator />
          </div>
        )}
      </div>

      <div className="flex flex-row justify-between gap-3 px-2 py-4">
        <div
          onClick={toggleVoiceMode}
          className="flex justify-center items-center min-w-16 min-h-16 bg-blue-600 rounded-full cursor-pointer"
        >
          <img src={Face} className="w-7 h-7" />
        </div>

        <form className="w-full relative" onSubmit={handleSubmit}>
          <input
            className="flex justify-center items-center h-16 text-xl px-3 w-full rounded-full border-2 border-black-400 pr-16"
            value={text}
            onChange={handleInputChange}
            placeholder="พิมพ์ข้อความ..."
          />
          <button className="absolute translate-y-[-50%] right-2 top-1/2 bg-black-900 w-12 h-12 rounded-full flex justify-center items-center">
            <GoArrowUp size={24} color="white" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SatangTextMode;
