import React from 'react';
import { useState } from 'react';
import axios from '../../../api/axios';
import { isAxiosError, AxiosError } from 'axios';
import Modal from '../../../components/Modal';
import IconSelector from './IconSelector';
import type { CategoryModalProps } from '../../../interface/category';
import { showToastAlert } from '../../../store/toastStore';
import type { ElysiaResponse } from '../../../interface/error';
import { RxCross2 } from 'react-icons/rx';
import { useTranslation } from 'react-i18next';

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  selectedType,
  refresh,
}) => {
  const { t } = useTranslation();
  const [newCategory, setNewCategory] = useState({ name: '', iconId: '' });
  const [loading, setLoading] = useState(false);

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      return showToastAlert(t('category_name_required', 'กรุณากรอกชื่อหมวดหมู่'), 'error');
    }

    if (!newCategory.iconId) {
      return showToastAlert(t('icon_required', 'กรุณาเลือกไอคอน'), 'error');
    }

    try {
      setLoading(true);
      await axios.post('/category', {
        name: newCategory.name.trim(),
        iconId: Number(newCategory.iconId),
        type: selectedType,
      });

      showToastAlert(t('add_category_success', 'เพิ่มหมวดหมู่สำเร็จ'), 'success');
      setNewCategory({ name: '', iconId: '' });
      await refresh();
      onClose();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const axiosError = err as AxiosError<ElysiaResponse>;
        const data = axiosError.response?.data;

        const customError = data?.errors?.find((e) => e.schema?.error)?.schema?.error;

        const errorMessage =
          customError ||
          data?.errors?.[0]?.summary ||
          data?.message ||
          t('add_category_error', 'ไม่สามารถเพิ่มหมวดหมู่ได้');

        showToastAlert(errorMessage, 'error');
      } else if (err instanceof Error) {
        showToastAlert(`${err.message}`, 'error');
      } else {
        showToastAlert(t('unknown_error', 'เกิดข้อผิดพลาดไม่ทราบชนิด'), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNewCategory({ name: '', iconId: '' });
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleCreateCategory();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex justify-center">
        <div className="p-6 flex flex-col gap-4 bg-white dark:bg-black-800 rounded-2xl min-w-[382px] max-w-md">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-center mb-2 dark:text-white">
              {selectedType === 'INCOME'
                ? t('add_category_income', 'เพิ่มหมวดหมู่รายรับ')
                : t('add_category_expense', 'เพิ่มหมวดหมู่รายจ่าย')}
            </h2>
            <div
              onClick={onClose}
              className="bg-black-300 dark:bg-black-600 flex justify-center items-center rounded-full w-12 h-12 hover:bg-black-400 dark:hover:bg-black-500 cursor-pointer"
            >
              <RxCross2 size={25} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="my-6">
              <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
                <IconSelector
                  selectedIconId={newCategory.iconId}
                  onSelect={(id) => setNewCategory({ ...newCategory, iconId: id })}
                />
              </div>
            </div>
            <label
              htmlFor="category-name"
              className="text-base font-medium text-gray-700 dark:text-gray-300"
            >
              {t('category_name_label', 'ชื่อหมวดหมู่')}
            </label>
            <input
              id="category-name"
              type="text"
              placeholder={t('category_name_placeholder', 'ระบุชื่อหมวดหมู่')}
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              onKeyPress={handleKeyPress}
              disabled={loading}
              maxLength={50}
              className="border border-gray-300 dark:border-black-500 rounded-md px-3 py-2 text-base bg-white dark:bg-black-700 text-black-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-black-600 disabled:cursor-not-allowed transition"
            />
          </div>

          <div className="flex gap-3 mt-1">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-gray-200 dark:bg-black-600 text-gray-700 dark:text-white py-2.5 rounded-lg hover:bg-gray-300 dark:hover:bg-black-500 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {t('cancel_btn', 'ยกเลิก')}
            </button>
            <button
              onClick={handleCreateCategory}
              disabled={loading || !newCategory.name.trim() || !newCategory.iconId}
              className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? t('saving', 'กำลังบันทึก...') : t('add_category', 'เพิ่มหมวดหมู่')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryModal;
