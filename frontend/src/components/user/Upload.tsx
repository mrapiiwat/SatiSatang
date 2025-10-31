import React, { useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { FaCloudUploadAlt } from 'react-icons/fa';
import type { UploadProps } from '../../types/home';
import { showSwalAlert } from '../../utils/SwalAlert';

const Upload: React.FC<UploadProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    showSwalAlert(`อัปโหลดไฟล์สำเร็จ: ${selectedFile.name}`, 'success');
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="flex justify-center items-center px-6">
      <div className="bg-white w-full max-w-96 min-h-[350px] rounded-2xl py-7 px-8 shadow-md flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-medium text-lg">อัปโหลดสลิป</h4>
          <div
            onClick={onClose}
            className="bg-black-300 flex justify-center items-center rounded-full w-12 h-12 hover:bg-black-400 cursor-pointer transition"
          >
            <RxCross2 size={25} />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-5 mb-6">
          <label
            htmlFor="fileInput"
            className="flex flex-col items-center justify-center border-2 border-dashed border-black-300 rounded-2xl w-full py-10 cursor-pointer hover:bg-black-100 transition"
          >
            <FaCloudUploadAlt className="text-5xl text-blue-600 mb-3" />
            <p className="text-sm text-black-900 font-medium">คลิกเพื่อเลือกไฟล์สลิป</p>
            <p className="text-xs text-black-500">(รองรับเฉพาะ .jpg, .png, .pdf)</p>
            <input
              id="fileInput"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {selectedFile && (
            <div className="text-center">
              <p className="text-sm font-semibold text-black-900 mb-1 truncate overflow-hidden text-ellipsis whitespace-nowrap max-w-[250px] mx-auto text-center">
                {selectedFile.name}
              </p>
              <p className="text-xs text-black-500 mb-2">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              {previewUrl && (
                <div className="mt-2">
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-full max-h-[200px] object-contain rounded-lg border border-black-200"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className={`w-full py-3 rounded-full font-semibold text-white transition ${
              selectedFile ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black-400 cursor-not-allowed'
            }`}
          >
            {selectedFile ? 'อัปโหลด' : 'เลือกไฟล์ก่อน'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Upload;
