import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);

export const getDeadlineFromFrequency = (frequency: string): Date => {
  const now = new Date();
  let deadline = new Date(now);

  switch (frequency) {
    case 'DAILY': {
      deadline.setHours(23, 59, 59, 999);
      break;
    }
    case 'WEEKLY': {
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
      deadline = new Date(monday);
      deadline.setDate(monday.getDate() + 6);
      deadline.setHours(23, 59, 59, 999);
      break;
    }
    case 'MONTHLY': {
      deadline = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    }
    case 'YEARLY': {
      deadline = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    }
    default: {
      deadline.setHours(23, 59, 59, 999);
    }
  }

  return deadline;
};
