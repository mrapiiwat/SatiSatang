import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

interface ImageProps {
  src: string;
  alt: string;
}

const Image: React.FC<ImageProps> = ({ src, alt }) => {
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

  return <img src={imageSrc} alt={alt} />;
};

export default Image;
