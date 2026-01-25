import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { RxCross2 } from 'react-icons/rx';
import axios from '../../../api/axios';
import { isAxiosError, AxiosError } from 'axios';
import useAuthStore from '../../../store/authStore';
import { showToastAlert } from '../../../store/toastStore';
import FileUploadArea from './FileUploadArea';
import TransactionForm from './TransactionForm';
import ImageModal from './ImageModal';
import type { OptionType, CategoryOptions, Category } from '../../../interface/home';
import type { SingleValue } from 'react-select';
import type { ElysiaResponse } from '../../../interface/error';

const transactionTypes: OptionType[] = [
  { value: 'INCOME', label: 'รายรับ' },
  { value: 'EXPENSE', label: 'รายจ่าย' },
];

const Upload: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const today = new Date();
  const formattedDate = today
    .toLocaleDateString('th-TH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .replace('วัน', '')
    .replace('ที่', '')
    .replace('พ.ศ. ', '');
  const { token } = useAuthStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState({
    date: '',
    description: '',
    type: '',
    categoryId: '',
    amount: '',
    fromAccount: '',
    toAccount: '',
  });
  const [categories, setCategories] = useState<CategoryOptions[]>([]);
  const [selectedCategoryOption, setSelectedCategoryOption] = useState<CategoryOptions | null>(
    null,
  );
  const [selectedTypeOption, setSelectedTypeOption] = useState<OptionType | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!transactionData.type) return setCategories([]);

      try {
        const res = await axios.get(`/categories?type=${transactionData.type}`);
        const data = Array.isArray(res.data) ? res.data : (res.data.data ?? []);
        const formatted: CategoryOptions[] = data.map((cat: Category) => ({
          value: String(cat.id),
          label: cat.name,
        }));
        setCategories(formatted);

        if (transactionData.categoryId) {
          setSelectedCategoryOption(
            formatted.find((opt) => opt.value === transactionData.categoryId) || null,
          );
        } else setSelectedCategoryOption(null);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, [transactionData.type, transactionData.categoryId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) setPreviewUrl(URL.createObjectURL(file));
      else setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('receipt', selectedFile);

    try {
      setLoading(true);
      const res = await axios.post('/transaction/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      const data = res.data.transactionData;
      setTransactionData(data);
      setSelectedTypeOption(transactionTypes.find((t) => t.value === data.type) || null);
      setIsOpen(true);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<ElysiaResponse>;
        const data = axiosError.response?.data;

        const customError = Array.isArray(data?.errors)
          ? data?.errors.find((e: { schema?: { error?: string } }) => e.schema?.error)?.schema
              ?.error
          : null;

        const msg =
          customError ||
          (Array.isArray(data?.errors) ? data?.errors?.[0]?.summary : null) ||
          data?.message ||
          'ไม่สามารถอ่านข้อมูลจากสลิปได้';

        showToastAlert(msg, 'error');
      } else if (error instanceof Error) {
        showToastAlert(error.message, 'error');
      } else {
        showToastAlert('เกิดข้อผิดพลาดไม่ทราบสาเหตุ', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransactionData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, option: SingleValue<OptionType>) => {
    if (name === 'type') {
      setTransactionData((prev) => ({ ...prev, type: option?.value || '', categoryId: '' }));
      setSelectedTypeOption(option);
      setSelectedCategoryOption(null);
    } else if (name === 'categoryId') {
      setTransactionData((prev) => ({ ...prev, categoryId: option?.value || '' }));
      setSelectedCategoryOption(option);
    }
  };

  const handleSave = async () => {
    if (
      !transactionData.description ||
      !transactionData.type ||
      !transactionData.categoryId ||
      !transactionData.amount
    )
      return showToastAlert('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');

    try {
      const formData = new FormData();
      Object.entries(transactionData).forEach(([k, v]) => formData.append(k, String(v)));
      if (selectedFile) formData.append('receipt', selectedFile);

      await axios.post('/transaction', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToastAlert('สร้างธุรกรรมสำเร็จ', 'success');
      setIsOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<ElysiaResponse>;
        const data = axiosError.response?.data;

        const customError = Array.isArray(data?.errors)
          ? data?.errors.find((e) => e.schema?.error)?.schema?.error
          : null;

        const msg =
          customError ||
          (Array.isArray(data?.errors) ? data?.errors?.[0]?.summary : null) ||
          data?.message ||
          'เกิดข้อผิดพลาด';

        showToastAlert(msg, 'error');
      } else if (error instanceof Error) {
        showToastAlert(error.message, 'error');
      } else {
        showToastAlert('เกิดข้อผิดพลาดไม่ทราบสาเหตุ', 'error');
      }
    }
  };

  return (
    <div className="flex justify-center items-center">
      {!isOpen && !isImageModalOpen && (
        <div className="bg-white w-full max-w-96 min-h-[350px] rounded-2xl py-7 px-8 shadow-md flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-medium text-lg">อัปโหลดสลิป</h4>
            <div
              onClick={onClose}
              className="bg-gray-200 flex justify-center items-center rounded-full w-10 h-10 hover:bg-gray-300 cursor-pointer transition"
            >
              <RxCross2 size={20} />
            </div>
          </div>

          <FileUploadArea
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            onFileChange={handleFileChange}
          />

          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className={`w-full py-3 rounded-full font-semibold text-white transition ${selectedFile && !loading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            {loading ? 'กำลังตรวจสอบ' : selectedFile ? 'อัปโหลด' : 'เลือกไฟล์ก่อน'}
          </button>
        </div>
      )}

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-[70]">
        <div
          className="fixed inset-0 bg-black/40"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
        <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
          <Dialog.Panel className="bg-white rounded-2xl max-w-md w-full shadow-xl pointer-events-auto">
            <TransactionForm
              transactionData={transactionData}
              selectedTypeOption={selectedTypeOption}
              selectedCategoryOption={selectedCategoryOption}
              categories={categories}
              formattedDate={formattedDate}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
              onSave={handleSave}
              onClose={() => setIsOpen(false)}
              previewUrl={previewUrl}
              onPreviewClick={() => {
                setIsOpen(false);
                setIsImageModalOpen(true);
              }}
            />
          </Dialog.Panel>
        </div>
      </Dialog>

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setIsOpen(true);
        }}
        previewUrl={previewUrl}
      />
    </div>
  );
};

export default Upload;
