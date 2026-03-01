import React from 'react';
import SATISATANG from '../../public/SATISATANG.svg';

const Logo: React.FC = () => {
  return (
    <div className="flex justify-center">
      <img className="w-8 object-contain" src={SATISATANG} alt="SatiSatang Logo" />
    </div>
  );
};

export default Logo;
