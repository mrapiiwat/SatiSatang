import React from 'react';
import type { TooltipProps } from '../interface/components';
import { BsInfoCircle, BsQuestionCircle } from 'react-icons/bs';

const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top', type = 'info' }) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2 translate-y-1 group-hover:translate-y-0',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2 -translate-y-1 group-hover:translate-y-0',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2 translate-x-1 group-hover:translate-x-0',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2 -translate-x-1 group-hover:translate-x-0',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-zinc-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-zinc-800',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-zinc-800',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-zinc-800',
  };

  const IconComponent = type === 'help' ? BsQuestionCircle : BsInfoCircle;

  return (
    <div className="relative inline-flex items-center justify-center group cursor-pointer">
      {children ? (
        children
      ) : (
        <IconComponent
          size={16}
          className="text-gray-400 group-hover:text-gray-600 transition-colors"
        />
      )}

      <div
        className={`absolute w-max max-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 ${positionClasses[position]}`}
      >
        <div className="bg-zinc-800 text-zinc-100 text-xs px-2.5 py-1.5 rounded shadow-sm text-center relative">
          {text}
          <div
            className={`absolute border-[4px] border-transparent ${arrowClasses[position]}`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
