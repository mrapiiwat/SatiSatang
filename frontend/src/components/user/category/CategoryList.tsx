import React, { useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import Image from '../../../components/Image';
import Modal from '../../Modal';
import IconSelector from '../account/IconSelector';
import axios from '../../../api/axios';
import { isAxiosError } from 'axios';
import type { CategoriesType, CategoryListProps } from '../../../types/category';
import { showToastAlert } from '../../../store/toastStore';

const CategoryList: React.FC<CategoryListProps> = ({ categories, onAddClick, setCategories }) => {
  const [editingCategory, setEditingCategory] = useState<CategoriesType | null>(null);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({ name: '', iconId: '' });

  const handleCategoryClick = (category: CategoriesType) => {
    const iconId = category.icon.split('/').pop() || '';
    setEditData({ name: category.name, iconId });
    setEditingCategory(category);
  };

  const handleCloseModal = () => {
    if (!loading) {
      setEditingCategory(null);
      setEditData({ name: '', iconId: '' });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    if (!editData.name.trim()) {
      return showToastAlert('กรุณากรอกชื่อหมวดหมู่', 'error');
    }

    if (!editData.iconId) {
      return showToastAlert('กรุณาเลือกไอคอน', 'error');
    }

    try {
      setLoading(true);
      const res = await axios.put(`/category/${editingCategory.id}`, {
        name: editData.name.trim(),
        iconId: Number(editData.iconId),
      });

      await showToastAlert('แก้ไขหมวดหมู่สำเร็จ', 'success');

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id
            ? { ...cat, name: res.data.data.name, icon: res.data.data.icon }
            : cat,
        ),
      );

      handleCloseModal();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        showToastAlert(`${err.response?.data?.message || 'ไม่สามารถแก้ไขหมวดหมู่ได้'}`, 'error');
      } else if (err instanceof Error) {
        showToastAlert(`${err.message}`, 'error');
      } else {
        showToastAlert('เกิดข้อผิดพลาดไม่ทราบชนิด', 'error');
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

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-6 gap-x-4 justify-items-center transition-opacity duration-300">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => handleCategoryClick(cat)}
          >
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              <Image src={cat.icon} alt={cat.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-sm text-center">{cat.name}</span>
          </div>
        ))}

        <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={onAddClick}>
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-purple-600 text-2xl font-semibold hover:scale-110 transition-transform">
            <AiOutlinePlus />
          </div>
          <span className="text-sm text-center text-gray-700">เพิ่มหมวดหมู่</span>
        </div>
      </div>

      {editingCategory && (
        <Modal isOpen={!!editingCategory} onClose={handleCloseModal}>
          <div className="flex justify-center">
            <div className="p-6 flex flex-col gap-4 bg-white rounded-2xl min-w-[382px] max-w-md">
              <h2 className="text-xl font-semibold text-center mb-2">แก้ไขหมวดหมู่</h2>

              <div className="flex flex-col gap-2">
                <label htmlFor="category-name" className="text-sm font-medium text-gray-700">
                  ชื่อหมวดหมู่
                </label>
                <input
                  id="category-name"
                  type="text"
                  placeholder="ระบุชื่อหมวดหมู่"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  maxLength={50}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                />
                <span className="text-xs text-gray-500">{editData.name.length}/50 ตัวอักษร</span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">เลือกไอคอน</label>
                <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
                  <IconSelector
                    selectedIconId={editData.iconId}
                    selectedIconUrl={editingCategory.icon}
                    onSelect={(id) => setEditData({ ...editData, iconId: id })}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleUpdateCategory}
                  disabled={
                    loading ||
                    !editData.name.trim() ||
                    !editData.iconId ||
                    (editData.name === editingCategory?.name &&
                      editData.iconId === editingCategory?.icon.split('/').pop())
                  }
                  className={`flex-1 py-2.5 rounded-lg font-medium transition ${
                    loading ||
                    !editData.name.trim() ||
                    !editData.iconId ||
                    (editData.name === editingCategory?.name &&
                      editData.iconId === editingCategory?.icon.split('/').pop())
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default CategoryList;
