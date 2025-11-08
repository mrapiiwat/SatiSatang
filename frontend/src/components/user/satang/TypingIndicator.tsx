import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex gap-1 items-center h-6">
      {[...Array(3)].map((_, i) => (
        <span
          key={i}
          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce-smooth"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
};

export default TypingIndicator;
