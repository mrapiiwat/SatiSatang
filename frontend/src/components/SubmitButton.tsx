import React, { useMemo } from 'react';
import type { SubmitButtonProps } from '../interface/components';

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading, text }) => {
  const buttonClass = useMemo(
    () =>
      `flex items-center justify-center h-16 px-6 rounded-full gap-7 transition-colors ${
        isLoading
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
      }`,
    [isLoading],
  );

  return (
    <button type="submit" disabled={isLoading} className={buttonClass}>
      <p className="text-xl font-semibold text-black-50">{isLoading ? 'กำลังดำเนินการ' : text}</p>
    </button>
  );
};

export default SubmitButton;
