import React from 'react';
import type { ImageProps } from '../interface/components';

const Image: React.FC<ImageProps> = ({ src, alt, className }) => {
  return (
    <img
      className={className}
      src={src}
      alt={alt || 'image'}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.onerror = null;
      }}
    />
  );
};

export default Image;
