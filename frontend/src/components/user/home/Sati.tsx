import React, { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react'; // 1. เพิ่ม useCallback
import { RxCross2 } from 'react-icons/rx';
import { FaPlus } from 'react-icons/fa6';
import { GoArrowUp } from 'react-icons/go';
import AddMenu from './AddMenu';
import PageWrapper from '../../PageWrapper';
import type { SatiProps } from '../../../types/home';
import axios from '../../../api/axios';
import type { ChatMessage } from '../../../types/home';

const Sati: React.FC<SatiProps> = ({
  handleCloseChatModal,
  isMenuOpen,
  setIsMenuOpen,
  handleMenuSelect,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const prevMessagesLengthRef = useRef(messages.length);
  const isUserScrolledRef = useRef(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const fetchSession = useCallback(async (cursor?: number) => {
    setIsLoading(true);
    try {
      const res = await axios.get('/sati/session', {
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
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

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
    if (container && messages.length > 0 && !prevMessagesLengthRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!isUserScrolledRef.current) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = async () => {
      if (container.scrollTop < 50 && hasMore && !isLoading && nextCursor) {
        const prevScrollBottom = container.scrollHeight - container.scrollTop;

        await fetchSession(nextCursor);

        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - prevScrollBottom;
          }
        });
      }
    };

    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, [hasMore, isLoading, nextCursor, fetchSession]); // เพิ่ม fetchSession

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-end"
      onClick={handleCloseChatModal}
    >
      <PageWrapper animation="fade" duration={0.2}>
        <div
          ref={modalRef}
          className="bg-white rounded-t-3xl shadow-2xl z-50 w-full"
          style={{ height: 'calc(100vh - 80px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-full flex flex-col px-6 pt-5 pb-6">
            <div
              ref={containerRef}
              className="overscroll-contain border-[1px] bg-white border-black-500 rounded-xl flex-1 w-full overflow-y-auto p-2 mb-4 scrollbar-none flex flex-col"
            >
              <div className="flex justify-end m-3 mb-4 sticky top-3 z-10">
                <div
                  className="bg-gray-100 flex justify-center items-center rounded-full w-12 h-12 hover:bg-gray-200 cursor-pointer shadow-sm"
                  onClick={handleCloseChatModal}
                >
                  <RxCross2 size={25} />
                </div>
              </div>

              {hasMore && (
                <div className="text-center text-gray-400 text-xs py-2 w-full">
                  {isLoading ? 'กำลังโหลด...' : 'เลื่อนขึ้นเพื่อดูข้อความเก่า'}
                </div>
              )}

              <div className="flex flex-col gap-2 px-2">
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
              </div>

              <div className="h-2" />
            </div>

            <div className="flex flex-row justify-between gap-3 w-full">
              <div
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex justify-center items-center min-w-16 min-h-16 bg-blue-600 rounded-full relative cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <FaPlus size={25} color="white" />
                <AddMenu
                  isOpen={isMenuOpen}
                  onSelect={handleMenuSelect}
                  onClose={() => setIsMenuOpen(false)}
                />
              </div>

              <form className="w-full relative" onSubmit={(e) => e.preventDefault()}>
                <input
                  className="flex justify-center items-center h-16 text-xl pl-6 px-3 w-full rounded-full border-2 border-gray-200 focus:border-blue-500 outline-none pr-16 transition-all"
                  placeholder="ให้น้องสติช่วยจดนะ"
                />
                <button className="absolute translate-y-[-50%] right-2 top-1/2 bg-black-900 w-12 h-12 rounded-full flex justify-center items-center hover:bg-black-800 transition-colors">
                  <GoArrowUp size={24} color="white" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
};

export default Sati;
