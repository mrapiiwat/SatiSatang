import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import type { ImageProps } from '../types/components';

const Image: React.FC<ImageProps> = ({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState<string>();

  useEffect(() => {
    axios
      .get(src, {
        responseType: 'blob',
      })
      .then((res) => {
        const url = URL.createObjectURL(res.data);
        setImageSrc(url);
      })
      .catch((err) => {
        console.error('Error loading image:', err);
      });
  }, [src]);

  if (!imageSrc) return <p>Loading...</p>;

  return <img className={className} src={imageSrc} alt={alt} />;
};

export default Image;
