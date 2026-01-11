import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { Frequency } from "./budget.schema";

export const getPeriodRangeByFrequency = (frequency: string) => {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (frequency) {
    case Frequency.DAILY:
      start = startOfDay(now);
      end = endOfDay(now);
      break;
    case Frequency.WEEKLY:
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case Frequency.MONTHLY:
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case Frequency.YEARLY:
      start = startOfYear(now);
      end = endOfYear(now);
      break;
    default:
      throw new Error("Invalid frequency");
  }

  return { start, end };
};

export const getDeadlineFromFrequency = (frequency: string): Date => {
  const { end } = getPeriodRangeByFrequency(frequency);
  return end;
};

export const isSameDate = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};
