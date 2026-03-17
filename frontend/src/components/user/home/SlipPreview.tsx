import React from 'react';
import type { SlipPreviewProps } from '../../../interface/home';
import { useTranslation } from 'react-i18next';

const SlipPreview: React.FC<SlipPreviewProps> = ({
  transactionData,
  previewUrl,
  onPreviewClick,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-between items-center gap-4 bg-gray-100 rounded-lg py-4 px-6 mb-3">
      <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
        <span className="text-sm text-gray-800 truncate w-full text-center">
          {transactionData.fromAccount || t('daily_account', 'บัญชีของวัน')}
        </span>

        <div className="text-xl flex justify-center text-gray-600">↓</div>

        <span className="text-sm text-gray-800 truncate w-full text-center">
          {transactionData.toAccount}
        </span>
      </div>

      {previewUrl && (
        <img
          src={previewUrl}
          onClick={onPreviewClick}
          alt="Slip Preview"
          className="w-24 h-24 rounded-lg cursor-pointer object-cover hover:opacity-80 transition shrink-0"
        />
      )}
    </div>
  );
};

export default SlipPreview;
