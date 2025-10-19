import React, { useMemo } from 'react';
import type { InputFieldProps } from '../types/auth';

const InputField: React.FC<InputFieldProps> = ({
  id,
  type,
  value,
  onChange,
  placeholder = ' ',
  autoComplete,
  minLength,
  label,
}) => {
  const labelClass = useMemo(() => {
    const hasValue = value.trim() !== '';
    return `absolute left-6 z-10 bg-white px-1 text-gray-400 text-base transition-all duration-300 ease-in-out
      ${hasValue ? 'top-[-10px] text-sm text-black-400' : 'top-[18px] text-gray-400 text-base'}
      peer-focus:top-[-10px] peer-focus:text-sm peer-focus:text-black`;
  }, [value]);

  return (
    <div className="relative w-full">
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        className="peer h-16 w-full border border-black-400 px-6 py-4 rounded-full text-base focus:outline-none focus:border-blue-600"
      />
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
    </div>
  );
};

export default InputField;
