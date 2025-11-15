import React from 'react';
import { useState } from 'react';
import axios from '../../../api/axios';
import { isAxiosError } from 'axios';
import Modal from '../../../components/Modal';
import IconSelector from '../account/IconSelector';
import type { CategoryModalProps } from '../../../types/category';
import { showToastAlert } from '../../../store/toastStore';

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  selectedType,
  refresh,
}) => {
  const [newCategory, setNewCategory] = useState({ name: '', iconId: '' });
  const [loading, setLoading] = useState(false);

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      return showToastAlert('กรุณากรอกชื่อหมวดหมู่', 'error');
    }

    if (!newCategory.iconId) {
      return showToastAlert('กรุณาเลือกไอคอน', 'error');
    }

    try {
      setLoading(true);
      await axios.post('/category', {
        name: newCategory.name.trim(),
        iconId: Number(newCategory.iconId),
        type: selectedType,
      });

      await showToastAlert('เพิ่มหมวดหมู่สำเร็จ', 'success');
      setNewCategory({ name: '', iconId: '' });
      await refresh();
      onClose();
    } catch (err: unknown) {
      console.error('Error creating category:', err);
      if (isAxiosError(err)) {
        showToastAlert(`${err.response?.data?.message || 'ไม่สามารถเพิ่มหมวดหมู่ได้'}`, 'error');
      } else if (err instanceof Error) {
        showToastAlert(`${err.message}`, 'error');
      } else {
        showToastAlert('เกิดข้อผิดพลาดไม่ทราบชนิด', 'error');
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
        <div className="p-6 flex flex-col gap-4 bg-white rounded-2xl min-w-[382px] max-w-md">
          <h2 className="text-xl font-semibold text-center mb-2">เพิ่มหมวดหมู่ใหม่</h2>

          <div className="flex flex-col gap-2">
            <label htmlFor="category-name" className="text-sm font-medium text-gray-700">
              ชื่อหมวดหมู่
            </label>
            <input
              id="category-name"
              type="text"
              placeholder="ระบุชื่อหมวดหมู่"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              onKeyPress={handleKeyPress}
              disabled={loading}
              maxLength={50}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition"
            />
            <span className="text-xs text-gray-500">{newCategory.name.length}/50 ตัวอักษร</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">เลือกไอคอน</label>
            <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
              <IconSelector
                selectedIconId={newCategory.iconId}
                onSelect={(id) => setNewCategory({ ...newCategory, iconId: id })}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleCreateCategory}
              disabled={loading || !newCategory.name.trim() || !newCategory.iconId}
              className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'กำลังบันทึก...' : 'เพิ่มหมวดหมู่'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryModal;
