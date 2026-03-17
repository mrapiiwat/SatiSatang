import React from 'react';
import { FaCloudUploadAlt, FaFileAlt } from 'react-icons/fa';
import { RxCross2 } from 'react-icons/rx';
import type { FileUploadProps } from '../../../interface/home';
import { useTranslation } from 'react-i18next';

const FileUploadArea: React.FC<FileUploadProps> = ({ files, onFileChange, onRemoveFile }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 mb-6">
      <label
        htmlFor="fileInput"
        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl w-full py-10 cursor-pointer hover:bg-gray-50 transition"
      >
        <FaCloudUploadAlt className="text-5xl text-blue-600 mb-3" />
        <p className="text-sm text-gray-900 font-medium">
          {t('click_to_upload', 'คลิกเพื่อเลือกไฟล์สลิป')}
        </p>
        <p className="text-xs text-gray-500">
          {t('supported_formats', '(รองรับ .jpg, .png, .pdf)')}
        </p>
        <input
          id="fileInput"
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={onFileChange}
          className="hidden"
          multiple
        />
      </label>

      {files.length > 0 && (
        <div className="max-h-[150px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex justify-between items-center p-3 mb-2 bg-gray-50 border border-gray-200 rounded-xl"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-white p-2 rounded-lg border border-gray-100">
                  <FaFileAlt className="text-gray-400" />
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                    {index + 1}. {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                onClick={() => onRemoveFile(index)}
                className="p-1 text-gray-400 hover:text-red-500 transition"
              >
                <RxCross2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadArea;
