import React from 'react';
import type { DeadlineDisplayProps } from '../../../types/home';

const DeadlineDisplay: React.FC<DeadlineDisplayProps> = ({ deadline, now }) => {
  if (!deadline) return 'ไม่มีระยะเวลากำหนด';

  const date = new Date(deadline);
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) return 'ครบกำหนด';

  if (diffDays >= 2 && diffDays <= 3) return `อีก ${diffDays} วัน`;

  if (diffDays <= 1) {
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const seconds = Math.floor((diffMs / 1000) % 60);
    return `จะครบกำหนดใน ${hours} ชม. ${minutes} นาที ${seconds} วินาที`;
  }
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default DeadlineDisplay;
