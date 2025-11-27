import React from 'react';
import { Dialog } from '@headlessui/react';
import { RxCross2 } from 'react-icons/rx';
import type { ImageModalProps } from '../../../interface/home';

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, previewUrl }) => (
  <Dialog open={isOpen} onClose={onClose} className="relative z-[100]">
    <div className="fixed inset-0 bg-black/90" aria-hidden="true" onClick={onClose} />
    <div className="fixed inset-0 overflow-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <Dialog.Panel className="relative">
          <button
            onClick={onClose}
            className="fixed top-4 right-4 z-10 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition backdrop-blur-sm"
          >
            <RxCross2 size={32} />
          </button>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Full-screen Slip Preview"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            />
          )}
        </Dialog.Panel>
      </div>
    </div>
  </Dialog>
);

export default ImageModal;
