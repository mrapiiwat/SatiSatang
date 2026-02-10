import React, { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { FaPlus } from 'react-icons/fa6';
import { GoArrowUp } from 'react-icons/go';
import AddMenu from './AddMenu';
import PageWrapper from '../../PageWrapper';
import type { SatiProps, DraftData } from '../../../interface/home';
import axios from '../../../api/axios';
import type { ChatMessage, DraftStatus } from '../../../interface/home';
import TypingIndicator from '../satang/TypingIndicator';
import DraftCard from './DraftCard';
import Modal from '../../Modal';
import Manual from './Manual';

const Sati: React.FC<SatiProps> = ({
  handleCloseChatModal,
  isMenuOpen,
  setIsMenuOpen,
  handleMenuSelect,
  onRefresh,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const [isManualOpen, setIsManualOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<DraftData | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);

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
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
        createdAt: m.createdAt,
      }));

      if (!cursor) {
        setMessages(msgs);
        setIsFirstLoad(true);
      } else {
        setMessages((prev) => {
          const newMsgs = msgs.filter((m) => !prev.find((p) => p.id === m.id));
          return [...newMsgs, ...prev];
        });
        setIsFirstLoad(false);
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
      const nearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      isUserScrolledRef.current = !nearBottom;
    };
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isFirstLoad && messages.length > 0) {
      container.scrollTop = container.scrollHeight;
      setIsFirstLoad(false);
    } else if (isSending || !isUserScrolledRef.current) {
      if (messages.length > prevMessagesLengthRef.current) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, isSending, isFirstLoad]);

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
  }, [hasMore, isLoading, nextCursor, fetchSession]);

  const handleEditDraft = (draft: DraftData, msgId: number) => {
    setEditingDraft(draft);
    setEditingMessageId(msgId);
    setIsManualOpen(true);
  };

  const handleSaveEditedDraft = async (newData: DraftData) => {
    if (editingMessageId) {
      let newContentStr = '';

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === editingMessageId) {
            try {
              const parsed = JSON.parse(msg.content);
              const newContentObj = {
                ...parsed,
                data: newData,
              };
              newContentStr = JSON.stringify(newContentObj);
              return { ...msg, content: newContentStr };
            } catch {
              return msg;
            }
          }
          return msg;
        }),
      );

      if (newContentStr) {
        try {
          await axios.put(`/sati/message/${editingMessageId}`, {
            content: newContentStr,
          });
        } catch (error) {
          console.error('Failed to update draft on server:', error);
        }
      }
    }

    setIsManualOpen(false);
    setEditingDraft(null);
    setEditingMessageId(null);
  };

  const handleManualSuccess = () => {
    setIsManualOpen(false);
    setEditingDraft(null);
    if (onRefresh) onRefresh();
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const userText = inputValue;
    setInputValue('');
    setIsSending(true);

    setMessages((prev) => {
      const lastMsg = prev[prev.length - 1];
      const newMessages = [...prev];

      if (
        lastMsg &&
        lastMsg.role === 'assistant' &&
        lastMsg.content.includes('"create_transaction"')
      ) {
        newMessages.pop();
      }

      return [
        ...newMessages,
        {
          id: Date.now(),
          role: 'user',
          content: userText,
          createdAt: new Date().toISOString(),
        },
      ];
    });

    try {
      const res = await axios.post('/sati/check-message', {
        content: userText,
      });

      const result = res.data.data;
      const botContent = typeof result === 'object' ? JSON.stringify(result) : result.message;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: botContent,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmSave = async (draftData: DraftData) => {
    const userConfirmText = `ตกลง`;
    const botSuccessText = JSON.stringify({ type: 'message', message: 'บันทึกเรียบร้อยครับ!' });

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: userConfirmText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append('type', draftData.type);
      formData.append('amount', draftData.amount.toString());
      formData.append('description', draftData.description);
      formData.append('categoryId', draftData.categoryId.toString());

      await axios.post('/transaction', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (onRefresh) {
        onRefresh();
      }

      await axios.post('/sati/log', { role: 'user', content: userConfirmText });
      await axios.post('/sati/log', { role: 'assistant', content: botSuccessText });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: botSuccessText,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Save failed:', error);
      alert('บันทึกไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = async (msgId: number) => {
    const userCancelText = 'ยกเลิก';
    const botCancelText = JSON.stringify({
      type: 'message',
      message: 'รับทราบครับ ยกเลิกรายการให้แล้วครับ',
    });

    setIsSending(true);

    try {
      setMessages((prev) => prev.filter((m) => m.id !== msgId));

      await axios.post('/sati/log', { role: 'user', content: userCancelText });
      await axios.post('/sati/log', { role: 'assistant', content: botCancelText });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: 'user',
          content: userCancelText,
          createdAt: new Date().toISOString(),
        },
      ]);

      await new Promise((resolve) => setTimeout(resolve, 800));

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: botCancelText,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Cancel failed:', error);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessageContent = (msg: ChatMessage, index: number) => {
    if (msg.role === 'user') return msg.content;

    try {
      const parsed = JSON.parse(msg.content);

      if (
        (parsed.type === 'create_transaction' || parsed.ui_type === 'CONFIRM_CARD') &&
        parsed.data
      ) {
        const nextMsg = messages[index + 1];
        let status: DraftStatus = 'pending';
        if (nextMsg && nextMsg.role === 'user') {
          status = nextMsg.content === 'ตกลง' ? 'confirmed' : 'cancelled';
        }

        return (
          <DraftCard
            data={parsed.data}
            onConfirm={() => handleConfirmSave(parsed.data)}
            onCancel={() => handleCancel(msg.id)}
            onEdit={() => handleEditDraft(parsed.data, msg.id)}
            status={status}
          />
        );
      }

      if (parsed.type === 'message' && parsed.message) {
        return parsed.message;
      }

      return parsed.message || JSON.stringify(parsed);
    } catch {
      return msg.content;
    }
  };

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

              <div className="flex flex-col gap-3 px-2">
                {messages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  const isCard =
                    !isUser &&
                    msg.content.trim().startsWith('{') &&
                    msg.content.includes('"create_transaction"');

                  return (
                    <div
                      key={msg.id}
                      className={`break-words whitespace-pre-wrap ${
                        isUser
                          ? 'bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none self-end w-fit max-w-[85%]'
                          : isCard
                            ? 'w-full'
                            : 'bg-gray-100 text-black p-3 rounded-2xl rounded-tl-none self-start w-fit max-w-[85%]'
                      }`}
                    >
                      {renderMessageContent(msg, index)}
                    </div>
                  );
                })}

                {isSending && (
                  <div className="self-start w-fit max-w-[85%]">
                    <TypingIndicator />
                  </div>
                )}
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

              <form className="w-full relative" onSubmit={handleSendMessage}>
                <input
                  className="flex justify-center items-center h-16 text-xl pl-6 px-3 w-full rounded-full border-2 border-gray-200 focus:border-blue-500 outline-none pr-16 transition-all"
                  placeholder="ให้น้องสติช่วยจดนะ"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={isSending}
                  className={`absolute translate-y-[-50%] right-2 top-1/2 w-12 h-12 rounded-full flex justify-center items-center transition-colors ${
                    isSending ? 'bg-gray-400' : 'bg-black-900 hover:bg-black-800'
                  }`}
                >
                  <GoArrowUp size={24} color="white" />
                </button>
              </form>
            </div>
          </div>
        </div>

        <Modal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)}>
          <Manual
            onClose={() => setIsManualOpen(false)}
            onSuccess={handleManualSuccess}
            editData={editingDraft}
            onUpdateDraft={handleSaveEditedDraft}
          />
        </Modal>
      </PageWrapper>
    </div>
  );
};

export default Sati;
