import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { GoArrowUp } from 'react-icons/go';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import type { SatangTextModeProps } from '../../../interface/satang';
import TypingIndicator from './TypingIndicator';
import PageWrapper from '../../PageWrapper';
import TrackingFace from './TrackingFace';

const SatangTextMode: React.FC<SatangTextModeProps> = ({
  text,
  setText,
  sendMessage,
  messages,
  isTyping,
  loadMore,
  hasMore,
  isLoadingHistory,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const prevScrollHeightRef = useRef<number>(0);
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
      const nearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      isUserScrolledRef.current = !nearBottom;

      if (container.scrollTop < 50 && hasMore && !isLoadingHistory) {
        prevScrollHeightRef.current = container.scrollHeight;
        loadMore();
      }
    };

    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, [loadMore, hasMore, isLoadingHistory]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prevLength = prevMessagesLengthRef.current;
    const currLength = messages.length;

    if (currLength > prevLength && container.scrollTop < 100) {
      const newScrollHeight = container.scrollHeight;
      const heightDifference = newScrollHeight - prevScrollHeightRef.current;

      if (heightDifference > 0) {
        container.scrollTop = heightDifference + container.scrollTop;
      }
    } else if (!isUserScrolledRef.current) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }

    prevMessagesLengthRef.current = currLength;
    if (!isLoadingHistory) {
      prevScrollHeightRef.current = container.scrollHeight;
    }
  }, [messages, isLoadingHistory]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, []);

  return (
    <PageWrapper animation="scale-fade">
      <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between px-6 py-6">
        <div
          ref={containerRef}
          className="border-[1px] border-black-600 rounded-xl flex-1 w-full mb-5 overflow-y-auto p-2 max-h-[75vh] scrollbar-none flex flex-col gap-2 relative"
        >
          {isLoadingHistory && (
            <div className="w-full flex justify-center py-4 relative">
              <AiOutlineLoading3Quarters className="animate-spin text-blue-600" />
            </div>
          )}

          {hasMore && !isLoadingHistory && (
            <div className="text-center text-gray-400 text-xs mb-2 opacity-50">
              เลื่อนขึ้นเพื่อโหลดเพิ่มเติม...
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-2xl w-fit max-w-[75%] break-words whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white self-end rounded-tr-none'
                  : 'bg-gray-100 text-black self-start rounded-tl-none'
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
          <TrackingFace />

          <form className="w-full relative" onSubmit={handleSubmit}>
            <input
              className="flex justify-center items-center h-16 text-xl px-3 w-full rounded-full border-2 border-black-400 pr-16"
              value={text}
              onChange={handleInputChange}
              placeholder="พิมพ์ข้อความ..."
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!text.trim() || isTyping}
              className="absolute translate-y-[-50%] right-2 top-1/2 bg-black-900 w-12 h-12 rounded-full flex justify-center items-center disabled:bg-gray-400"
            >
              <GoArrowUp size={24} color="white" />
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
};

export default SatangTextMode;
