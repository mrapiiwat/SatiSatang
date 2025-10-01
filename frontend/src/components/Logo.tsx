import React from 'react';
import SatiSatang from '../assets/SATISATANG.svg';

const Logo: React.FC = () => {
  return (
    <div className="flex justify-center">
      <img className="w-8 object-contain" src={SatiSatang} alt="SatiSatang Logo" />
    </div>
  );
};

export default Logo;
