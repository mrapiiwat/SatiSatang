import React, { useMemo } from 'react';
import type { SubmitButtonProps } from '../interface/components';
import { useTranslation } from 'react-i18next';

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading, disabled, text }) => {
  const { t } = useTranslation();
  const buttonClass = useMemo(() => {
    const isNotAllowed = isLoading || disabled;

    return `flex items-center justify-center h-16 px-6 rounded-full gap-7 transition-colors ${
      isNotAllowed
        ? 'bg-gray-400 cursor-not-allowed opacity-70'
        : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
    }`;
  }, [isLoading, disabled]);

  return (
    <button type="submit" disabled={isLoading || disabled} className={buttonClass}>
      <p className="text-xl font-semibold text-black-50">
        {isLoading ? t('processing', 'กำลังดำเนินการ') : text}
      </p>
    </button>
  );
};

export default SubmitButton;
