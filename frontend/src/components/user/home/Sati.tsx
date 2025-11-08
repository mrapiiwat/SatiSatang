import React, { useRef } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { FaPlus } from 'react-icons/fa6';
import { GoArrowUp } from 'react-icons/go';
import AddMenu from './AddMenu';
import PageWrapper from '../../PageWrapper';
import type { SatiProps } from '../../../types/home';

const Sati: React.FC<SatiProps> = ({
  handleCloseChatModal,
  isMenuOpen,
  setIsMenuOpen,
  handleMenuSelect,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-end">
      <PageWrapper animation="fade" duration={0.2}>
        <div
          ref={modalRef}
          className="bg-white rounded-t-3xl shadow-2xl z-50 w-full"
          style={{ height: 'calc(100vh - 80px)' }}
        >
          <div className="h-full flex flex-col px-6 pt-5 pb-6">
            <div className="border-[1px] bg-white border-black-500 rounded-xl flex-1 w-full overflow-y-auto p-2 mb-4 scrollbar-none">
              <div className="flex justify-end m-3">
                <div
                  className="bg-black-300 flex justify-center items-center rounded-full w-12 h-12 hover:bg-black-400 cursor-pointer"
                  onClick={handleCloseChatModal}
                >
                  <RxCross2 size={25} />
                </div>
              </div>
            </div>

            <div className="flex flex-row justify-between gap-3 w-full">
              <div
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex justify-center items-center min-w-16 min-h-16 bg-blue-600 rounded-full relative cursor-pointer hover:bg-blue-700"
              >
                <FaPlus size={25} color="white" />
                <AddMenu
                  isOpen={isMenuOpen}
                  onSelect={handleMenuSelect}
                  onClose={() => setIsMenuOpen(false)}
                />
              </div>

              <form className="w-full relative">
                <input
                  className="flex justify-center items-center h-16 text-xl pl-4 px-3 w-full rounded-full border-2 border-black-400 pr-16"
                  placeholder="ให้น้องสติช่วยจดนะ"
                />
                <button className="absolute translate-y-[-50%] right-2 top-1/2 bg-black-900 w-12 h-12 rounded-full flex justify-center items-center hover:bg-black-800">
                  <GoArrowUp size={24} color="white" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
};

export default Sati;
