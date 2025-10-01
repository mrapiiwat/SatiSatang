import React from 'react';

interface OAuthButtonProps {
  onClick: () => void;
  label: string;
  logo: string;
}

const OAuthButton: React.FC<OAuthButtonProps> = ({ onClick, label, logo }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center h-16 border border-[#CECDCA] px-6 rounded-full gap-7 cursor-pointer hover:bg-gray-100 transition-colors"
  >
    <img className="w-8 object-contain" src={logo} alt={`${label} Logo`} />
    <h4 className="text-base">{label}</h4>
  </button>
);

export default OAuthButton;
