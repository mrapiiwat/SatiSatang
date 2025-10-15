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
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage(text);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between px-6 py-6">
      <div className="border-[1px] border-black-600 rounded-xl flex-1 w-full mb-5 overflow-y-auto p-2 max-h-[75vh] scrollbar-none">
        {messages.map(msg => (
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

        <div ref={chatEndRef} />
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
