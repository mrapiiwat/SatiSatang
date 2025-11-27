import React, { useCallback, useEffect, useState } from 'react';
import axios from '../../../api/axios';
import Image from '../../Image';
import type { IconSelectorProps, Icon } from '../../../interface/account';

const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIconId,
  selectedIconUrl,
  onSelect,
  disabled = false,
}) => {
  const [icons, setIcons] = useState<Icon[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchIcons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/icon${search ? `?search=${search}` : ''}`);
      const iconsData: Icon[] = res.data.data || [];
      setIcons(iconsData);

      if (selectedIconId) {
        const found = iconsData.find((icon) => icon.id.toString() === selectedIconId);
        if (found) setSelectedIcon(found);
      }
    } catch (err) {
      console.error('Error fetching icons:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedIconId]);

  useEffect(() => {
    if (isModalOpen) fetchIcons();
  }, [fetchIcons, isModalOpen]);

  const handleSelectIcon = (icon: Icon) => {
    setSelectedIcon(icon);
    onSelect(icon.id.toString());
    setIsModalOpen(false);
    setSearch('');
  };

  const handleOpenModal = () => {
    if (!disabled) setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearch('');
  };

  return (
    <>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleOpenModal}
          disabled={disabled}
          className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all ${
            disabled
              ? 'opacity-50 cursor-not-allowed bg-gray-100'
              : 'cursor-pointer hover:scale-105 hover:shadow-md'
          } ${
            selectedIconId
              ? 'border-blue-600 bg-white shadow-sm'
              : 'border-gray-300 bg-white hover:border-blue-600'
          }`}
        >
          {selectedIcon?.url || selectedIconUrl ? (
            <Image
              src={selectedIcon?.url || selectedIconUrl!}
              alt={selectedIcon?.description || 'selected icon'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-3xl font-light">+</span>
          )}
        </button>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-sm h-[520px] shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-center mb-4 text-gray-800">เลือกไอคอน</h3>

            <input
              type="text"
              placeholder="ค้นหา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 transition"
            />

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-4 p-2">
              <div className="grid grid-cols-4 gap-4">
                {loading ? (
                  <div className="col-span-full text-center text-gray-400 py-10">
                    <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : icons.length === 0 ? (
                  <p className="col-span-full text-center text-gray-400 py-12 text-sm">
                    ไม่พบไอคอน
                  </p>
                ) : (
                  icons.map((icon) => (
                    <button
                      key={icon.id}
                      type="button"
                      onClick={() => handleSelectIcon(icon)}
                      className={`w-full aspect-square rounded-full border-2 flex items-center justify-center transition-all p-px ${
                        selectedIconId === icon.id.toString()
                          ? 'border-blue-600 bg-purple-50 shadow-md scale-105'
                          : 'border-gray-200 hover:border-blue-600 hover:scale-110 bg-white'
                      }`}
                      title={icon.description}
                    >
                      <Image
                        src={icon.url}
                        alt={icon.description}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 transition font-medium text-sm"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IconSelector;
