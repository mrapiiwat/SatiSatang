import React, { useState, useRef } from 'react';
import SATISATANG from '../../../public/SATASATANG_LOGO_BLACK_VERTICAL_TH.svg';
import { IoAttachOutline, IoCloseOutline } from 'react-icons/io5';
import useAuthStore from '../../store/authStore';
import { showToastAlert } from '../../store/toastStore';

const Feedback: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const user = useAuthStore((state) => state.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!feedbackText.trim() && !selectedImage) {
      showToastAlert('กรุณาพิมพ์ข้อความ', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      const base64Images: string[] = [];
      if (selectedImage) {
        const base64 = await fileToBase64(selectedImage);
        base64Images.push(base64);
      }

      const deviceInfo = navigator.userAgent;

      const payload = {
        email: user?.email || 'ไม่ระบุอีเมล',
        name: user?.name || 'ไม่ระบุชื่อ',
        feedback: feedbackText,
        deviceInfo: deviceInfo,
        images: base64Images,
      };

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      });

      const result = await response.json();

      if (result.status === 'success') {
        showToastAlert('ส่งความคิดเห็นสำเร็จ ขอบคุณครับ!', 'success');
        setFeedbackText('');
        setSelectedImage(null);
      } else {
        showToastAlert('เกิดข้อผิดพลาด: ' + result.message, 'error');
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      showToastAlert('ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white flex flex-col items-center min-h-[calc(100dvh-80px)] overflow-y-auto">
      <div className="w-full max-w-2xl flex flex-col flex-grow pb-5">
        <div className="flex flex-col items-center justify-center text-center flex-grow px-6">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <img src={SATISATANG} alt="โลโก้สติสตางค์" className="w-48 object-contain" />
          </div>

          <p className="text-gray-700 text-lg leading-relaxed mb-6 sm:mb-8 mt-4">
            ความคิดเห็นของคุณมีความหมายกับเราเสมอ
            <br />
            มาร่วมแบ่งปันประสบการณ์หลังการใช้งาน
            <br />
            <span className="font-semibold">“สติสตางค์”</span>
            <br />
            เพื่อให้เรานำทุกคำแนะนำไปปรับปรุงและพัฒนา
          </p>

          <h2 className="text-4xl sm:text-4xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-blue-700 via-purple-300 to-green-600 text-transparent bg-clip-text">
            Your Voice Matters
          </h2>

          <div className="w-full mb-6">
            <div
              className={`w-full min-h-[10rem] sm:min-h-[12rem] flex flex-col border rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent bg-white overflow-hidden p-3 transition-all ${isLoading ? 'opacity-70 pointer-events-none' : 'border-gray-300'}`}
            >
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full flex-grow outline-none resize-none bg-transparent p-1 text-gray-700 placeholder-gray-400 min-h-[6rem] text-base"
                placeholder="พิมพ์ความคิดเห็นได้ที่นี่"
              />

              {selectedImage && (
                <div className="px-2 pb-2 mt-2">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-gray-200 overflow-hidden group shadow-sm">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                      type="button"
                    >
                      <IoCloseOutline className="text-sm" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center px-1 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || !!selectedImage}
                  className={`p-2 rounded-full transition-colors flex items-center justify-center ${selectedImage ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600'}`}
                  title="แนบรูปภาพ"
                >
                  <IoAttachOutline className="text-2xl sm:text-3xl transform -rotate-45" />
                </button>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
                {selectedImage && <span className="text-sm text-gray-400 ml-2">แนบแล้ว 1 รูป</span>}
              </div>
            </div>
          </div>

          <div className="w-full flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`text-white px-8 py-3 rounded-full text-base font-medium transition-colors shadow-md ${isLoading ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-700 hover:bg-indigo-800'}`}
            >
              {isLoading ? 'กำลังส่งข้อมูล...' : 'ส่งความคิดเห็น'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
