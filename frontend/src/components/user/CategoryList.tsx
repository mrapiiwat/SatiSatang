import React from 'react';
import { useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import Image from '../../components/Image';
import Modal from '../Modal';
import IconSelector from '../user/IconSelector';
import type { CategoriesType } from '../../types/home';
import axios from '../../api/axios';
import type { CategoryListProps } from '../../types/home';
import { RxCross2 } from 'react-icons/rx';
import { isAxiosError } from 'axios';

const CategoryList: React.FC<CategoryListProps> = ({ categories, onAddClick, setCategories }) => {
  const [editingCategory, setEditingCategory] = useState<CategoriesType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCategoryClick = (category: CategoriesType) => {
    setEditingCategory(category);
  };

  const handleCloseModal = () => {
    setEditingCategory(null);
  };

  const handleUpdateCategory = async (updatedData: { name: string; iconId: string }) => {
    if (!editingCategory) return;

    try {
      setLoading(true);
      const res = await axios.put(
        `/category/${editingCategory.id}`,
        {
          name: updatedData.name,
          iconId: Number(updatedData.iconId),
        },
        { withCredentials: true },
      );

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id
            ? { ...cat, name: res.data.data.name, icon: res.data.data.icon }
            : cat,
        ),
      );

      setEditingCategory(null);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        alert(err.response?.data?.message || 'ไม่สามารถแก้ไขหมวดหมู่ได้');
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('เกิดข้อผิดพลาดไม่ทราบชนิด');
      }
    } finally {
      setLoading(false);
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
          <div className="flex justify-center items-center px-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4">
              <div className="flex justify-between items-center mb-5">
                <h4 className="font-medium">บันทึกรายรับรายจ่าย</h4>
                <div
                  onClick={handleCloseModal}
                  className="bg-black-300 flex justify-center items-center rounded-full w-12 h-12 hover:bg-black-400 cursor-pointer"
                >
                  <RxCross2 size={25} />
                </div>
              </div>

              <input
                type="text"
                value={editingCategory.name}
                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                className="border-[1px] text-black-900 border-black-500 w-full h-10 rounded-md p-1 px-3"
                placeholder="ชื่อหมวดหมู่"
              />

              <div className="flex-1 overflow-y-auto py-3">
                <IconSelector
                  selectedIconId={editingCategory.icon.split('/').pop() || ''}
                  onSelect={(iconId) =>
                    setEditingCategory({ ...editingCategory, icon: `/api/icon/${iconId}` })
                  }
                />
              </div>

              <button
                onClick={() =>
                  handleUpdateCategory({
                    name: editingCategory.name,
                    iconId: editingCategory.icon.split('/').pop() || '',
                  })
                }
                disabled={loading}
                className={`w-full py-2.5 rounded-xl text-white font-medium transition ${
                  loading ? 'bg-blue-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-600/95'
                }`}
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default CategoryList;
