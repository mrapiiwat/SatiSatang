import {
  endOfDay,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { Frequency } from "./budget.schema";

export const getCustomMonthRange = (now: Date, budgetStartDate: number) => {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  let startYear = currentYear;
  let startMonth = currentMonth;

  if (currentDate < budgetStartDate) {
    startMonth = currentMonth - 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear--;
    }
  }

  const maxDaysInStartMonth = new Date(startYear, startMonth + 1, 0).getDate();
  const actualStartDate = Math.min(budgetStartDate, maxDaysInStartMonth);
  const start = new Date(startYear, startMonth, actualStartDate, 0, 0, 0, 0);

  let endYear = startYear;
  let endMonth = startMonth + 1;
  if (endMonth > 11) {
    endMonth = 0;
    endYear++;
  }

  const maxDaysInEndMonth = new Date(endYear, endMonth + 1, 0).getDate();
  const actualEndDate = Math.min(budgetStartDate, maxDaysInEndMonth);

  const end = new Date(endYear, endMonth, actualEndDate - 1, 23, 59, 59, 999);

  return { start, end };
};

export const getPeriodRangeByFrequency = (
  frequency: string,
  budgetStartDate: number = 1
) => {
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
      return getCustomMonthRange(now, budgetStartDate);
    case Frequency.YEARLY:
      start = startOfYear(now);
      end = endOfYear(now);
      break;
    default:
      throw new Error("Invalid frequency");
  }

  return { start, end };
};

export const getDeadlineFromFrequency = (
  frequency: string,
  budgetStartDate: number = 1
): Date => {
  const { end } = getPeriodRangeByFrequency(frequency, budgetStartDate);
  return end;
};

export const isSameDate = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};
