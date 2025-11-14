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

export const getPeriodRangeByFrequency = (frequency: string) => {
  const now = new Date();
  let start: Date;
  let end: Date;

  if (frequency === 'DAILY') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  } else if (frequency === 'WEEKLY') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    start = new Date(now.setDate(diff));
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (frequency === 'MONTHLY') {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  } else if (frequency === 'YEARLY') {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  } else {
    throw new Error('Invalid frequency');
  }

  return { start, end };
};
