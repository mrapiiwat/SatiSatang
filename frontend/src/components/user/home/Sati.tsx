import React, { useRef, useEffect, useState, useLayoutEffect, useCallback, useMemo } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { FaPlus } from 'react-icons/fa6';
import { GoArrowUp } from 'react-icons/go';
import AddMenu from './AddMenu';
import PageWrapper from '../../PageWrapper';
import type { SatiProps, DraftData, BudgetDraftData, GoalDraftData } from '../../../interface/home';
import axios from '../../../api/axios';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import type {
  ChatMessage,
  DraftStatus,
  MessageContentData,
  EditingDraftType,
} from '../../../interface/home';
import TypingIndicator from '../satang/TypingIndicator';
import DraftCard from './DraftCard';
import BudgetDraftCard from './BudgetDraftCard';
import GoalDraftCard from './GoalDraftCard';
import Modal from '../../Modal';
import Manual from './Manual';
import Budget from './Budget';
import Goal from './Goal';
import ReactMarkdown from 'react-markdown';

const Sati: React.FC<SatiProps> = ({
  handleCloseChatModal,
  isMenuOpen,
  setIsMenuOpen,
  handleMenuSelect,
  onRefresh,
  onSwitchToSatang,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const [isManualOpen, setIsManualOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<EditingDraftType>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editType, setEditType] = useState<'TRANSACTION' | 'BUDGET' | 'GOAL'>('TRANSACTION');

  const prevMessagesLengthRef = useRef(messages.length);
  const isUserScrolledRef = useRef(false);

  const isPendingAction = useMemo(() => {
    if (messages.length === 0) return false;
    const lastMsg = messages[messages.length - 1];

    if (lastMsg.role === 'user') return false;

    try {
      const parsed = JSON.parse(lastMsg.content);
      const isCard =
        parsed.type === 'create_transaction' ||
        parsed.type === 'create_budget' ||
        parsed.type === 'create_goal' ||
        parsed.ui_type === 'CONFIRM_CARD';

      if (isCard) {
        const currentStatus = parsed.data?.status || 'pending';
        return currentStatus === 'pending';
      }
      return false;
    } catch {
      return false;
    }
  }, [messages]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const getErrorMessage = (error: unknown): string => {
    if (isAxiosError(error) && error.response?.data) {
      const data = error.response.data as { message?: string; error?: string; summary?: string };
      if (typeof data === 'string') return data;
      if (data.message) return data.message;
      if (data.error) return data.error;
      if (data.summary) return data.summary;
    }
    return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุครับ';
  };

  const fetchSession = useCallback(async (cursor?: number) => {
    setIsLoading(true);
    try {
      const res = await axios.get('/sati/session', { params: { cursor, limit: 20 } });
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

  const handleEditDraft = (
    draft: EditingDraftType,
    msgId: number,
    type: 'TRANSACTION' | 'BUDGET' | 'GOAL',
  ) => {
    setEditingDraft(draft);
    setEditingMessageId(msgId);
    setEditType(type);
    setIsManualOpen(true);
  };

  const handleSaveEditedDraft = async (newData: EditingDraftType) => {
    if (editingMessageId && newData) {
      let newContentStr = '';
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === editingMessageId) {
            try {
              const parsed = JSON.parse(msg.content);
              const newContentObj = { ...parsed, data: newData };
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
          await axios.put(`/sati/message/${editingMessageId}`, { content: newContentStr });
        } catch (error) {
          console.error('Failed to update draft:', error);
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
    if (!inputValue.trim() || isSending || isPendingAction) return;

    const userText = inputValue;
    setInputValue('');
    setIsSending(true);

    setMessages((prev) => {
      const lastMsg = prev[prev.length - 1];
      const newMessages = [...prev];
      if (
        lastMsg &&
        lastMsg.role === 'assistant' &&
        (lastMsg.content.includes('"create_transaction"') ||
          lastMsg.content.includes('"create_budget"') ||
          lastMsg.content.includes('"create_goal"'))
      ) {
        newMessages.pop();
      }
      return [
        ...newMessages,
        { id: Date.now(), role: 'user', content: userText, createdAt: new Date().toISOString() },
      ];
    });

    try {
      const res = await axios.post('/sati/check-message', { content: userText });
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

      setTimeout(() => {
        fetchSession();
      }, 500);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const updateMessageStatus = async (
    msgId: number,
    originalContent: MessageContentData,
    newStatus: DraftStatus,
  ) => {
    try {
      const newContentObj = {
        ...originalContent,
        data: {
          ...originalContent.data,
          status: newStatus,
        },
      };
      const newContentStr = JSON.stringify(newContentObj);

      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, content: newContentStr } : m)),
      );

      await axios.put(`/sati/message/${msgId}`, { content: newContentStr });
    } catch (err) {
      console.error('Failed to update message status:', err);
    }
  };

  const handleConfirmSave = async (
    draftData: DraftData,
    msgId: number,
    originalContent: MessageContentData,
  ) => {
    const userConfirmText = `ตกลง`;
    const botSuccessText = JSON.stringify({ type: 'message', message: 'บันทึกเรียบร้อยครับ!' });

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: 'user',
        content: userConfirmText,
        createdAt: new Date().toISOString(),
      },
    ]);
    setIsSending(true);

    try {
      const payload = {
        type: draftData.type,
        amount: Number(draftData.amount),
        description: draftData.description,
        categoryId: Number(draftData.categoryId),
        isGoal: draftData.isGoal || false,
      };

      await axios.post('/transaction', payload);

      if (onRefresh) onRefresh();

      await updateMessageStatus(msgId, originalContent, 'confirmed');

      await axios.post('/sati/log', { role: 'user', content: userConfirmText });
      await axios.post('/sati/log', { role: 'assistant', content: botSuccessText });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: botSuccessText,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      const botErrorText = JSON.stringify({
        type: 'message',
        message: `บันทึกรายการไม่สำเร็จครับ: ${errorMsg}`,
      });
      await axios.post('/sati/log', { role: 'assistant', content: botErrorText });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: botErrorText,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveBudget = async (
    data: BudgetDraftData,
    msgId: number,
    originalContent: MessageContentData,
  ) => {
    const userConfirmText = 'ตกลง';
    const botSuccessText = JSON.stringify({
      type: 'message',
      message: 'ตั้งงบประมาณเรียบร้อยครับ!',
    });

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: 'user',
        content: userConfirmText,
        createdAt: new Date().toISOString(),
      },
    ]);
    setIsSending(true);

    try {
      await axios.post('/budget', data);

      if (onRefresh) onRefresh();

      await updateMessageStatus(msgId, originalContent, 'confirmed');

      await axios.post('/sati/log', { role: 'user', content: userConfirmText });
      await axios.post('/sati/log', { role: 'assistant', content: botSuccessText });

      await new Promise((r) => setTimeout(r, 1000));
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: botSuccessText,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      const botErrorText = JSON.stringify({
        type: 'message',
        message: `ตั้งงบประมาณไม่สำเร็จครับ: ${errorMsg}`,
      });
      await axios.post('/sati/log', { role: 'assistant', content: botErrorText });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: botErrorText,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveGoal = async (
    data: GoalDraftData,
    msgId: number,
    originalContent: MessageContentData,
  ) => {
    const userConfirmText = 'ตกลง';
    const botSuccessText = JSON.stringify({
      type: 'message',
      message: `ตั้งเป้าหมาย "${data.name}" เรียบร้อย! เป็นกำลังใจให้นะครับ ✌️`,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: 'user',
        content: userConfirmText,
        createdAt: new Date().toISOString(),
      },
    ]);
    setIsSending(true);

    try {
      await axios.post('/goal', data);

      if (onRefresh) onRefresh();

      await updateMessageStatus(msgId, originalContent, 'confirmed');

      await axios.post('/sati/log', { role: 'user', content: userConfirmText });
      await axios.post('/sati/log', { role: 'assistant', content: botSuccessText });

      await new Promise((r) => setTimeout(r, 1000));
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: botSuccessText,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      const botErrorText = JSON.stringify({
        type: 'message',
        message: `ตั้งเป้าหมายไม่สำเร็จครับ: ${errorMsg}`,
      });
      await axios.post('/sati/log', { role: 'assistant', content: botErrorText });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: botErrorText,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = async (msgId: number, originalContent: MessageContentData) => {
    const userCancelText = 'ยกเลิก';
    const botCancelText = JSON.stringify({
      type: 'message',
      message: 'รับทราบครับ ยกเลิกรายการให้แล้วครับ',
    });
    setIsSending(true);
    try {
      await updateMessageStatus(msgId, originalContent, 'cancelled');

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
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessageContent = (msg: ChatMessage, isLastMessage: boolean) => {
    if (msg.role === 'user') return msg.content;

    const renderMarkdown = (text: string) => (
      <div className="whitespace-normal text-[15px] leading-relaxed [&_ul_ul]:mb-0 [&_ul_ul]:mt-1">
        <ReactMarkdown
          components={{
            p: ({ node: _node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
            ul: ({ node: _node, ...props }) => (
              <ul className="list-disc ml-5 mb-3 space-y-1" {...props} />
            ),
            ol: ({ node: _node, ...props }) => (
              <ol className="list-decimal ml-5 mb-3 space-y-1" {...props} />
            ),
            li: ({ node: _node, ...props }) => <li className="" {...props} />,
            strong: ({ node: _node, ...props }) => (
              <strong className="font-bold text-gray-900" {...props} />
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

      const parsed = JSON.parse(cleanContent);
      const currentStatus: DraftStatus = parsed.data?.status || 'pending';

      if (
        (parsed.type === 'create_transaction' || parsed.ui_type === 'CONFIRM_CARD') &&
        parsed.data
      ) {
        return (
          <DraftCard
            data={parsed.data}
            status={currentStatus}
            onConfirm={() => handleConfirmSave(parsed.data, msg.id, parsed)}
            onCancel={() => handleCancel(msg.id, parsed)}
            onEdit={() => handleEditDraft(parsed.data, msg.id, 'TRANSACTION')}
          />
        );
      }

      if (parsed.type === 'create_budget' && parsed.data) {
        return (
          <BudgetDraftCard
            data={parsed.data}
            status={currentStatus}
            onConfirm={() => handleSaveBudget(parsed.data, msg.id, parsed)}
            onCancel={() => handleCancel(msg.id, parsed)}
            onEdit={() => handleEditDraft(parsed.data, msg.id, 'BUDGET')}
          />
        );
      }

      if (parsed.type === 'create_goal' && parsed.data) {
        return (
          <GoalDraftCard
            data={parsed.data}
            status={currentStatus}
            onConfirm={() => handleSaveGoal(parsed.data, msg.id, parsed)}
            onCancel={() => handleCancel(msg.id, parsed)}
            onEdit={() => handleEditDraft(parsed.data, msg.id, 'GOAL')}
          />
        );
      }

      if (parsed.type === 'message_with_action') {
        return (
          <div className="flex flex-col gap-1">
            {renderMarkdown(parsed.message)}
            {isLastMessage && parsed.action && (
              <button
                onClick={() => {
                  if (parsed.action.action_type === 'switch_to_satang') {
                    handleCloseChatModal();
                    navigate('/user/satang');
                    if (onSwitchToSatang) onSwitchToSatang();
                  } else if (parsed.action.action_type === 'manage_categories') {
                    handleCloseChatModal();
                    navigate('/user/categories');
                  }
                }}
                className="mt-1 w-fit flex items-center gap-1 text-blue-300 hover:text-blue-300/50 text-sm font-medium transition-colors group"
              >
                <span className="underline decoration-blue-300 underline-offset-4">
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

      if (parsed.type === 'message' && parsed.message) return renderMarkdown(parsed.message);

      return renderMarkdown(parsed.message || JSON.stringify(parsed));
    } catch {
      if (msg.role === 'assistant') {
        return renderMarkdown(msg.content);
      }
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
                  const isLastMessage = index === messages.length - 1;
                  const isCard =
                    !isUser &&
                    msg.content.trim().startsWith('{') &&
                    (msg.content.includes('"create_transaction"') ||
                      msg.content.includes('"create_budget"') ||
                      msg.content.includes('"create_goal"'));
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
                      {renderMessageContent(msg, isLastMessage)}
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
                onClick={() => {
                  if (!isPendingAction) {
                    setIsMenuOpen(!isMenuOpen);
                  }
                }}
                className={`flex justify-center items-center min-w-16 min-h-16 rounded-full relative transition-colors ${
                  isPendingAction
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 cursor-pointer hover:bg-blue-700'
                }`}
              >
                <FaPlus size={25} color="white" />
                {!isPendingAction && (
                  <AddMenu
                    isOpen={isMenuOpen}
                    onSelect={handleMenuSelect}
                    onClose={() => setIsMenuOpen(false)}
                  />
                )}
              </div>
              <form className="w-full relative" onSubmit={handleSendMessage}>
                <input
                  className={`flex justify-center items-center h-16 text-xl pl-6 px-3 w-full rounded-full border-2 outline-none pr-16 transition-all ${
                    isPendingAction
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-gray-200 focus:border-blue-500'
                  }`}
                  placeholder={
                    isPendingAction ? 'กรุณากด ยืนยัน หรือ ยกเลิก' : 'ให้น้องสติช่วยจดนะ'
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isSending || isPendingAction}
                />
                <button
                  type="submit"
                  disabled={isSending || isPendingAction}
                  className={`absolute translate-y-[-50%] right-2 top-1/2 w-12 h-12 rounded-full flex justify-center items-center transition-colors ${
                    isSending || isPendingAction
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-black-900 hover:bg-black-800'
                  }`}
                >
                  <GoArrowUp size={24} color="white" />
                </button>
              </form>
            </div>
          </div>
        </div>

        <Modal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)}>
          {editType === 'BUDGET' ? (
            <Budget
              onClose={() => setIsManualOpen(false)}
              onSuccess={handleManualSuccess}
              editData={editingDraft as BudgetDraftData}
              onUpdateDraft={handleSaveEditedDraft}
            />
          ) : editType === 'GOAL' ? (
            <Goal
              onClose={() => setIsManualOpen(false)}
              onSuccess={handleManualSuccess}
              editData={editingDraft as GoalDraftData}
              onUpdateDraft={handleSaveEditedDraft}
            />
          ) : (
            <Manual
              onClose={() => setIsManualOpen(false)}
              onSuccess={handleManualSuccess}
              editData={editingDraft as DraftData}
              onUpdateDraft={handleSaveEditedDraft}
            />
          )}
        </Modal>
      </PageWrapper>
    </div>
  );
};
export default Sati;
