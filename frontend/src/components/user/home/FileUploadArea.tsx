import React from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import type { FileUploadProps } from '../../../types/home';

const FileUploadArea: React.FC<FileUploadProps> = ({ selectedFile, previewUrl, onFileChange }) => (
  <div className="flex flex-col items-center justify-center gap-5 mb-6">
    <label
      htmlFor="fileInput"
      className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl w-full py-10 cursor-pointer hover:bg-gray-50 transition"
    >
      <FaCloudUploadAlt className="text-5xl text-blue-600 mb-3" />
      <p className="text-sm text-gray-900 font-medium">คลิกเพื่อเลือกไฟล์สลิป</p>
      <p className="text-xs text-gray-500">(รองรับ .jpg, .png, .pdf)</p>
      <input
        id="fileInput"
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={onFileChange}
        className="hidden"
      />
    </label>

    {selectedFile && (
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-900 mb-1 truncate max-w-[250px] mx-auto">
          {selectedFile.name}
        </p>
        <p className="text-xs text-gray-500 mb-2">
          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
        </p>
        {previewUrl && (
          <img
            src={previewUrl}
            alt="preview"
            className="w-full max-h-[200px] object-contain rounded-lg border border-gray-200"
          />
        )}
      </div>
    )}
  </div>
);

export default FileUploadArea;
