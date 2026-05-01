import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { GoArrowUp } from 'react-icons/go';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import type { SatangTextModeProps, ChatMessage } from '../../../interface/satang';
import TypingIndicator from './TypingIndicator';
import PageWrapper from '../../PageWrapper';
import TrackingFace from './TrackingFace';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { IoChevronBackOutline } from 'react-icons/io5';
import Tooltip from '../../Tooltip';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const prevScrollHeightRef = useRef<number>(0);
  const isUserScrolledRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  const incomingText = useRef(location.state?.initialText);

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

  useEffect(() => {
    if (incomingText.current) {
      setText(incomingText.current);

      window.history.replaceState({}, document.title);
    }
  }, [setText]);

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

  useEffect(() => {
    if (location.state?.initialText) {
      setText(location.state.initialText);
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate, setText]);

  const renderMessageContent = (
    msg: ChatMessage,
    isLastMessage: boolean,
    failedQuestion: string,
  ) => {
    if (msg.role === 'user') return msg.content;

    const renderMarkdown = (text: string) => (
      <div className="markdown-body text-[15px] leading-relaxed [&_ul_ul]:mb-0 [&_ul_ul]:mt-1">
        <ReactMarkdown
          components={{
            p: ({ node: _node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
            ul: ({ node: _node, ...props }) => (
              <ul className="list-disc ml-5 mb-3 space-y-1" {...props} />
            ),
            ol: ({ node: _node, ...props }) => (
              <ol className="list-decimal ml-5 mb-3 space-y-1" {...props} />
            ),
            li: ({ node: _node, ...props }) => <li className="" {...props} />,
            strong: ({ node: _node, ...props }) => (
              <strong className="font-bold text-gray-900 dark:text-gray-200" {...props} />
            ),
            h3: ({ node: _node, ...props }) => (
              <h3 className="text-lg font-bold mt-4 mb-2" {...props} />
            ),
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    );

    try {
      let cleanContent = msg.content.trim();

      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent
          .replace(/^```(json)?\n?/, '')
          .replace(/\n?```$/, '')
          .trim();
      }

      if (cleanContent.startsWith('{')) {
        const parsed = JSON.parse(cleanContent) as {
          type?: string;
          message?: string;
          action?: {
            action_type?: string;
            label?: string;
          };
        };

        if (parsed.type === 'message_with_action') {
          return (
            <div className="flex flex-col gap-1">
              {renderMarkdown(parsed.message || '')}
              {isLastMessage && parsed.action && parsed.action.action_type === 'switch_to_sati' && (
                <button
                  onClick={() => {
                    navigate('/user', { state: { openSati: true, initialText: failedQuestion } });
                  }}
                  className="mt-2 w-fit flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium transition-colors group"
                >
                  <span className="underline decoration-blue-600 dark:decoration-blue-400 underline-offset-4">
                    {parsed.action.label}
                  </span>
                  <svg
                    xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>
              )}
            </div>
          );
        }
      }

      return renderMarkdown(msg.content);
    } catch {
      return renderMarkdown(msg.content);
    }
  };

  return (
    <PageWrapper animation="scale-fade">
      <div className="min-h-[calc(100vh-80px)] flex flex-col justify-evenly px-6">
        <div className="flex justify-between items-center px-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 cursor-pointer dark:text-white"
          >
            <IoChevronBackOutline />
            <span className="font-normal">{t('back_btn', 'ย้อนกลับ')}</span>
          </button>
          <Tooltip
            text="AI พี่สตางค์ ผู้ช่วยแนะนำด้านการเงิน ไม่ว่าจะถามเรื่องเล็กตั้งแต่ ให้แสดงรายจ่ายในสัปดาห์นี้ ไปจนถึงเรื่องลงทุนอย่างการให้แนะนำหุ้น"
            position="left"
            type="info"
          />
        </div>
        <div
          ref={containerRef}
          className="border-[1px] border-black-600 rounded-xl flex-1 w-full overflow-y-auto p-2 max-h-[70vh] scrollbar-none flex flex-col gap-2 relative"
        >
          {isLoadingHistory && (
            <div className="w-full flex justify-center py-4 relative">
              <AiOutlineLoading3Quarters className="animate-spin text-blue-600" />
            </div>
          )}

          {hasMore && !isLoadingHistory && (
            <div className="text-center text-gray-400 text-xs mb-2 opacity-50">
              {t('scroll_up_to_load', 'เลื่อนขึ้นเพื่อโหลดเพิ่มเติม...')}
            </div>
          )}

          {messages.map((msg, index) => {
            const isLastMessage = index === messages.length - 1;
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const failedQuestion = prevMsg?.role === 'user' ? prevMsg.content : '';

            return (
              <div
                key={msg.id}
                className={`p-3 rounded-2xl w-fit max-w-[75%] break-words ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white self-end rounded-tr-none whitespace-pre-wrap'
                    : 'bg-gray-100 dark:bg-black-800 text-black dark:text-white self-start rounded-tl-none'
                }`}
              >
                {renderMessageContent(msg, isLastMessage, failedQuestion)}
              </div>
            );
          })}

          {isTyping && (
            <div className="ml-2">
              <TypingIndicator />
            </div>
          )}
        </div>

        <div className="flex flex-row items-center gap-3 px-2 py-4">
          <TrackingFace mode="satang" />

          <form className="flex-1 relative" onSubmit={handleSubmit}>
            <input
              className="flex justify-center items-center h-16 text-xl pl-6 px-3 w-full rounded-full border-2 border-black-400 dark:border-black-600 bg-white dark:bg-black-800 text-black-900 dark:text-white pr-16"
              value={text}
              onChange={handleInputChange}
              placeholder={t('type_message_placeholder', 'พิมพ์ข้อความ...')}
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!text.trim() || isTyping}
              className="absolute translate-y-[-50%] right-2 top-1/2 bg-black-900 dark:bg-black-600 w-12 h-12 rounded-full flex justify-center items-center disabled:bg-gray-400 dark:disabled:bg-black-700"
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
