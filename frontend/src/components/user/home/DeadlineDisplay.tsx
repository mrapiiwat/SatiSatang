import React from 'react';
import { useTranslation } from 'react-i18next';
import type { DeadlineDisplayProps } from '../../../interface/home';

const DeadlineDisplay: React.FC<DeadlineDisplayProps> = ({ deadline, now }) => {
  const { t, i18n } = useTranslation();

  if (!deadline) return <>{t('no_deadline', 'ไม่มีระยะเวลากำหนด')}</>;

  const date = new Date(deadline);
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) return <>{t('deadline_reached', 'ครบกำหนด')}</>;

  if (diffDays >= 2 && diffDays <= 3) {
    return <>{t('days_left', { count: diffDays, defaultValue: `อีก {{count}} วัน` })}</>;
  }

  if (diffDays <= 1) {
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const seconds = Math.floor((diffMs / 1000) % 60);

    return (
      <>
        {t('countdown_format', {
          hours,
          minutes,
          seconds,
          defaultValue: `${hours} ชม. ${minutes} นาที ${seconds} วินาที`,
        })}
      </>
    );
  }

  const locale = i18n.language?.startsWith('en') ? 'en-US' : 'th-TH';

  return (
    <>
      {date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}
    </>
  );
};

export default DeadlineDisplay;
