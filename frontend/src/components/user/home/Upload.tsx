import React, { useState, useEffect, useMemo } from 'react';
import { Dialog } from '@headlessui/react';
import { RxCross2, RxChevronLeft, RxChevronRight } from 'react-icons/rx';
import { FaCloudUploadAlt } from 'react-icons/fa';
import axios from '../../../api/axios';
import { isAxiosError, AxiosError } from 'axios';
import { showToastAlert } from '../../../store/toastStore';
import FileUploadArea from './FileUploadArea';
import TransactionForm from './TransactionForm';
import ImageModal from './ImageModal';
import type {
  OptionType,
  CategoryOptions,
  Category,
  PendingTransaction,
  UploadResult,
} from '../../../interface/home';
import type { SingleValue } from 'react-select';
import type { ElysiaResponse } from '../../../interface/error';
import { useTranslation } from 'react-i18next';

const Upload: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();

  const transactionTypes: OptionType[] = useMemo(
    () => [
      { value: 'INCOME', label: t('income', 'รายรับ') },
      { value: 'EXPENSE', label: t('expense', 'รายจ่าย') },
    ],
    [t],
  );

  const [files, setFiles] = useState<File[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categories, setCategories] = useState<CategoryOptions[]>([]);

  const currentTransaction = useMemo(
    () => pendingTransactions[currentIndex] || null,
    [pendingTransactions, currentIndex],
  );
  const currentPreviewUrl = useMemo(() => {
    if (!currentTransaction || !files[currentTransaction.fileIndex]) return null;
    return URL.createObjectURL(files[currentTransaction.fileIndex]);
  }, [currentTransaction, files]);

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!currentTransaction?.data.type) return setCategories([]);

      try {
        const res = await axios.get(`/categories?type=${currentTransaction.data.type}`);
        const data = Array.isArray(res.data) ? res.data : (res.data.data ?? []);
        const formatted: CategoryOptions[] = data.map((cat: Category) => ({
          value: String(cat.id),
          label: cat.name,
        }));
        setCategories(formatted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, [currentTransaction?.data.type]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('receipt', file);
    });

    try {
      setLoading(true);
      const res = await axios.post('/transaction/upload', formData);

      const results = res.data.results || [];
      const newPendingList: PendingTransaction[] = [];

      results.forEach((r: UploadResult, index: number) => {
        if (r.status === 'success' && r.data) {
          newPendingList.push({
            id: `txn-${Date.now()}-${index}`,
            fileIndex: index,
            data: {
              date: r.data.date ? new Date(r.data.date).toISOString() : new Date().toISOString(),
              description: r.data.description || '',
              type: r.data.type || '',
              categoryId: r.data.categoryId ? String(r.data.categoryId) : '',
              amount: r.data.amount ? String(r.data.amount) : '',
              fromAccount: r.data.fromAccount || '',
              toAccount: r.data.toAccount || '',
            },
          });
        }
      });

      if (newPendingList.length === 0) {
        showToastAlert(t('upload_error_read_slip', 'ไม่สามารถอ่านข้อมูลจากสลิปได้'), 'error');
        return;
      }

      setPendingTransactions(newPendingList);
      setCurrentIndex(0);
      setIsOpen(true);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<ElysiaResponse>;
        const msg = axiosError.response?.data?.message || t('error_default', 'เกิดข้อผิดพลาด');
        showToastAlert(msg, 'error');
      } else {
        showToastAlert(t('unknown_error', 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ'), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentTransaction) return;
    const { name, value } = e.target;
    setPendingTransactions((prev) => {
      const newList = [...prev];
      newList[currentIndex].data = { ...newList[currentIndex].data, [name]: value };
      return newList;
    });
  };

  const handleSelectChange = (name: string, option: SingleValue<OptionType>) => {
    if (!currentTransaction) return;
    setPendingTransactions((prev) => {
      const newList = [...prev];
      if (name === 'type') {
        newList[currentIndex].data = {
          ...newList[currentIndex].data,
          type: option?.value || '',
          categoryId: '',
        };
      } else if (name === 'categoryId') {
        newList[currentIndex].data = {
          ...newList[currentIndex].data,
          categoryId: option?.value || '',
        };
      }
      return newList;
    });
  };

  const handleSave = async () => {
    if (!currentTransaction) return;
    const data = currentTransaction.data;

    if (!data.description || !data.type || !data.categoryId || !data.amount)
      return showToastAlert(t('manual_error_fill_all', 'กรุณากรอกข้อมูลให้ครบถ้วน'), 'error');

    try {
      const formData = new FormData();
      const d = new Date(data.date);
      const offsetDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);

      formData.append('type', data.type);
      formData.append('description', data.description);
      formData.append('amount', Number(data.amount).toString());
      formData.append('date', offsetDate.toISOString());
      formData.append('categoryId', Number(data.categoryId).toString());

      if (data.fromAccount) formData.append('fromAccount', data.fromAccount);
      if (data.toAccount) formData.append('toAccount', data.toAccount);

      const file = files[currentTransaction.fileIndex];
      if (file) formData.append('receipt', file);

      await axios.post('/transaction', formData);

      showToastAlert(t('save_success', 'สร้างธุรกรรมสำเร็จ'), 'success');

      const remaining = pendingTransactions.filter((_, idx) => idx !== currentIndex);
      if (remaining.length === 0) {
        setIsOpen(false);
        setPendingTransactions([]);
        setFiles([]);
        onClose();
      } else {
        setPendingTransactions(remaining);
        if (currentIndex >= remaining.length) setCurrentIndex(0);
      }
    } catch (error: unknown) {
      console.log(error);
      showToastAlert(t('save_error', 'เกิดข้อผิดพลาดในการบันทึก'), 'error');
    }
  };

  const getSelectedTypeOption = () =>
    transactionTypes.find((t) => t.value === currentTransaction?.data.type) || null;
  const getSelectedCategoryOption = () =>
    categories.find((c) => c.value === currentTransaction?.data.categoryId) || null;

  return (
    <div className="flex justify-center items-center">
      {!isOpen && !isImageModalOpen && (
        <div className="bg-white dark:bg-black-800 text-black-900 dark:text-white w-full max-w-96 min-h-[350px] rounded-2xl py-7 px-8 shadow-md flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-medium text-lg">{t('upload_slip', 'อัปโหลดสลิป')}</h4>
            <div
              onClick={onClose}
              className="bg-gray-200 dark:bg-black-600 flex justify-center items-center rounded-full w-10 h-10 hover:bg-gray-300 dark:hover:bg-black-500 cursor-pointer transition"
            >
              <RxCross2 size={20} />
            </div>
          </div>

          <FileUploadArea
            files={files}
            onFileChange={handleFileChange}
            onRemoveFile={handleRemoveFile}
          />

          <button
            onClick={handleUpload}
            disabled={files.length === 0 || loading}
            className={`w-full py-3 rounded-full font-semibold text-white transition ${files.length > 0 && !loading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            {loading ? t('processing', 'กำลังตรวจสอบ') : t('upload', 'อัปโหลด')}
          </button>
        </div>
      )}

      <Dialog open={loading} onClose={() => {}} className="relative z-[80]">
        <div className="fixed inset-0 bg-black-600/70 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white dark:bg-black-800 rounded-3xl w-full max-w-sm p-10 flex flex-col items-center justify-center shadow-sm">
            <div className="mb-6 relative">
              <FaCloudUploadAlt className="text-6xl text-[#4F14E5] animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              {t('uploading', 'กำลังอัปโหลดไฟล์')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('upload_count', {
                count: files.length,
                defaultValue: `จำนวน ${files.length} รายการ`,
              })}
            </p>
          </Dialog.Panel>
        </div>
      </Dialog>
      <Dialog open={isOpen} onClose={() => {}} className="relative z-[70]">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full flex-col items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-96 flex flex-col items-center outline-none">
              <div className="bg-white dark:bg-black-800 rounded-2xl w-full shadow-xl">
                {currentTransaction ? (
                  <TransactionForm
                    transactionData={currentTransaction.data}
                    selectedTypeOption={getSelectedTypeOption()}
                    selectedCategoryOption={getSelectedCategoryOption()}
                    categories={categories}
                    onInputChange={handleInputChange}
                    onSelectChange={handleSelectChange}
                    onSave={handleSave}
                    onClose={() => setIsOpen(false)}
                    previewUrl={currentPreviewUrl}
                    onPreviewClick={() => {
                      setIsOpen(false);
                      setIsImageModalOpen(true);
                    }}
                  />
                ) : (
                  <div className="text-center py-10">{t('no_data_found', 'ไม่พบข้อมูล')}</div>
                )}
              </div>

              {pendingTransactions.length > 1 && (
                <div className="flex items-center gap-3 mt-5 pb-4">
                  <button
                    onClick={() => setCurrentIndex((c) => Math.max(0, c - 1))}
                    disabled={currentIndex === 0}
                    className="w-12 h-12 flex items-center justify-center bg-white dark:bg-black-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-black-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-700 dark:text-gray-300"
                  >
                    <RxChevronLeft size={28} />
                  </button>

                  <div className="bg-white dark:bg-black-800 px-6 py-3 rounded-full shadow-lg text-gray-700 dark:text-gray-300 font-medium min-w-[160px] text-center">
                    {t('slip_count', {
                      current: currentIndex + 1,
                      total: pendingTransactions.length,
                      defaultValue: `สลิป ${currentIndex + 1} จาก ${pendingTransactions.length}`,
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentIndex((c) => Math.min(pendingTransactions.length - 1, c + 1))
                    }
                    disabled={currentIndex === pendingTransactions.length - 1}
                    className="w-12 h-12 flex items-center justify-center bg-white dark:bg-black-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-black-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-700 dark:text-gray-300"
                  >
                    <RxChevronRight size={28} />
                  </button>
                </div>
              )}
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setIsOpen(true);
        }}
        previewUrl={currentPreviewUrl}
      />
    </div>
  );
};

export default Upload;
