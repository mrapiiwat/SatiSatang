import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex justify-center">
      <img
        className="w-8 object-contain block dark:hidden"
        src="/SATISATANG.svg"
        alt="SatiSatang Logo"
      />

      <img
        className="w-8 object-contain hidden dark:block"
        src="/SATISATANG1.svg"
        alt="SatiSatang Logo Dark"
      />
    </div>
  );
};

export default Logo;
