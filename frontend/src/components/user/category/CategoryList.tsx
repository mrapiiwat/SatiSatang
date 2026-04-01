import React, { useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import Image from '../../../components/Image';
import Modal from '../../Modal';
import IconSelector from './IconSelector';
import axios from '../../../api/axios';
import { AxiosError, isAxiosError } from 'axios';
import type { CategoriesType, CategoryListProps } from '../../../interface/category';
import { showToastAlert } from '../../../store/toastStore';
import type { ElysiaResponse } from '../../../interface/error';
import { RxCross2 } from 'react-icons/rx';
import DeleteModal from '../../DeleteModal';
import { useTranslation } from 'react-i18next';

const CategoryList: React.FC<
  CategoryListProps & { onSwipeLeft?: () => void; onSwipeRight?: () => void }
> = ({ categories, onAddClick, setCategories, refresh, onSwipeLeft, onSwipeRight }) => {
  const { t } = useTranslation();
  const [editingCategory, setEditingCategory] = useState<CategoriesType | null>(null);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({ name: '', iconId: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);
  const [endX, setEndX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setEndX(null);
    setStartX(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => setEndX(e.targetTouches[0].clientX);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setEndX(null);
    setStartX(e.clientX);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) setEndX(e.clientX);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (startX === null || endX === null) return;
    const distance = startX - endX;

    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();

    setStartX(null);
    setEndX(null);
  };

  const handleCategoryClick = (category: CategoriesType & { iconId?: number }) => {
    const iconId = String(category.iconId || '');
    setEditData({ name: category.name, iconId });
    setEditingCategory(category);
  };

  const handleCloseModal = () => {
    if (loading || isDeleteModalOpen) return;
    setEditingCategory(null);
    setEditData({ name: '', iconId: '' });
  };

  const handleDeleteCategory = async () => {
    if (!editingCategory) return;
    try {
      setLoading(true);
      await axios.delete(`/category/${editingCategory.id}`);
      showToastAlert(t('del_category_success', 'ลบหมวดหมู่สำเร็จ'), 'success');

      if (refresh) {
        refresh();
      } else {
        setCategories((prev) => prev.filter((cat) => cat.id !== editingCategory.id));
      }

      setIsDeleteModalOpen(false);
      setEditingCategory(null);
      setEditData({ name: '', iconId: '' });
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const axiosError = err as AxiosError<ElysiaResponse>;
        const data = axiosError.response?.data;
        showToastAlert(data?.message || t('del_category_error', 'ไม่สามารถลบหมวดหมู่ได้'), 'error');
      } else if (err instanceof Error) {
        showToastAlert(`${err.message}`, 'error');
      } else {
        showToastAlert(t('unknown_error', 'เกิดข้อผิดพลาดไม่ทราบชนิด'), 'error');
      }
      setIsDeleteModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    if (!editData.name.trim())
      return showToastAlert(t('category_name_required', 'กรุณากรอกชื่อหมวดหมู่'), 'error');
    if (!editData.iconId) return showToastAlert(t('icon_required', 'กรุณาเลือกไอคอน'), 'error');

    try {
      setLoading(true);
      const res = await axios.put(`/category/${editingCategory.id}`, {
        name: editData.name.trim(),
        iconId: Number(editData.iconId),
      });

      showToastAlert(t('edit_category_success', 'แก้ไขหมวดหมู่สำเร็จ'), 'success');

      if (refresh) {
        refresh();
      } else {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingCategory.id
              ? {
                  ...cat,
                  name: res.data.data.name,
                  icon: res.data.data.icon,
                  iconId: res.data.data.iconId || Number(editData.iconId),
                }
              : cat,
          ),
        );
      }

      setEditingCategory(null);
      setEditData({ name: '', iconId: '' });
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const axiosError = err as AxiosError<ElysiaResponse>;
        const data = axiosError.response?.data;
        const customError = data?.errors?.find((e) => e.schema?.error)?.schema?.error;
        showToastAlert(
          customError ||
            data?.errors?.[0]?.summary ||
            data?.message ||
            t('edit_category_error', 'ไม่สามารถแก้ไขหมวดหมู่ได้'),
          'error',
        );
      } else if (err instanceof Error) {
        showToastAlert(`${err.message}`, 'error');
      } else {
        showToastAlert(t('unknown_error', 'เกิดข้อผิดพลาดไม่ทราบชนิด'), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleUpdateCategory();
    }
  };

  const isSaveDisabled = Boolean(
    loading ||
      !editData.name.trim() ||
      !editData.iconId ||
      (editingCategory &&
        editData.name === editingCategory.name &&
        String(editData.iconId) === String(editingCategory.iconId)),
  );

  return (
    <>
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        className="w-full min-h-[60vh] cursor-grab active:cursor-grabbing"
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-6 gap-x-4 justify-items-center transition-opacity duration-300">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col items-center gap-2 cursor-pointer"
              onClick={(e) => {
                if (startX && endX && Math.abs(startX - endX) > 10) {
                  e.preventDefault();
                  return;
                }
                handleCategoryClick(cat);
              }}
            >
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-black-700 flex items-center justify-center overflow-hidden pointer-events-none">
                <Image src={cat.icon} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-sm text-center">{cat.name}</span>
            </div>
          ))}

          <div
            className="flex flex-col items-center gap-2 cursor-pointer"
            onClick={(_e) => {
              if (startX && endX && Math.abs(startX - endX) > 10) return;
              onAddClick();
            }}
          >
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-black-700 flex items-center justify-center text-purple-600 text-2xl font-semibold hover:scale-110 transition-transform pointer-events-none">
              <AiOutlinePlus />
            </div>
            <span className="text-sm text-center text-gray-700 dark:text-gray-300">
              {t('add_category', 'เพิ่มหมวดหมู่')}
            </span>
          </div>
        </div>
      </div>

      {editingCategory && (
        <Modal isOpen={!!editingCategory} onClose={handleCloseModal}>
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 flex flex-col gap-4 bg-white dark:bg-black-800 rounded-2xl min-w-[382px] max-w-md">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-center mb-2 dark:text-white">
                  {t('edit_category', 'แก้ไขหมวดหมู่')}
                </h2>
                <div
                  onClick={handleCloseModal}
                  className="bg-black-300 dark:bg-black-600 flex justify-center items-center rounded-full w-12 h-12 hover:bg-black-400 dark:hover:bg-black-500 cursor-pointer"
                >
                  <RxCross2 size={25} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="my-6">
                  <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
                    <IconSelector
                      selectedIconId={editData.iconId}
                      selectedIconUrl={editingCategory.icon}
                      onSelect={(id) => setEditData({ ...editData, iconId: String(id) })}
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
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  maxLength={50}
                  className="border border-gray-300 dark:border-black-500 rounded-md px-3 py-2 text-base bg-white dark:bg-black-700 text-black-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-black-600 disabled:cursor-not-allowed transition"
                />
              </div>

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDeleteModalOpen(true);
                  }}
                  disabled={loading}
                  className="flex-1 bg-[#FF2D55] text-white py-2.5 rounded-lg hover:bg-[#f91e46] transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {t('delete_btn', 'ลบ')}
                </button>
                <button
                  type="button"
                  onClick={handleUpdateCategory}
                  disabled={isSaveDisabled}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition ${
                    isSaveDisabled
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {loading ? t('saving', 'กำลังบันทึก...') : t('save_btn', 'บันทึก')}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCategory}
        title={t('delete_category_confirm', 'ต้องการลบหมวดหมู่นี้ใช่หรือไม่?')}
        confirmText={loading ? t('deleting', 'กำลังลบ...') : t('yes_delete', 'ใช่ ลบเลย')}
        cancelText={t('cancel_btn', 'ยกเลิก')}
      />
    </>
  );
};

export default CategoryList;
