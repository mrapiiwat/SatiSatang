import { cron } from "@elysiajs/cron";
import { and, eq, isNull, sum } from "drizzle-orm";
import { Elysia } from "elysia";
import { db } from "@/db";
import {
  goals,
  goalTransaction,
  userFcmTokens,
  userSettings,
} from "@/db/schema";
import { NotificationService } from "./notification.service";

const notificationService = new NotificationService();

export const notificationCrons = new Elysia({ name: "Cron.Notification" }).use(
  cron({
    name: "daily-reminder",
    pattern: "0 09 * * *",
    async run() {
      try {
        const targetUsers = await db
          .select({
            userId: userSettings.userId,
            lang: userSettings.appLanguage,
          })
          .from(userSettings)
          .innerJoin(
            userFcmTokens,
            eq(userSettings.userId, userFcmTokens.userId)
          )
          .where(eq(userSettings.isNotificationEnabled, true));

        if (targetUsers.length === 0) return;
        const userMap = new Map<number, "th" | "en">();
        targetUsers.forEach((u) => {
          userMap.set(u.userId, u.lang as "th" | "en");
        });

        await Promise.allSettled(
          Array.from(userMap.entries()).map(([userId, lang]) =>
            notificationService.sendTemplatedNotification(
              userId,
              lang,
              "DAILY_REMINDER",
              undefined
            )
          )
        );
      } catch (error) {
        console.error("[Cron] Error:", error);
      }
    },
  })
);

export const goalReminderCron = new Elysia({ name: "Cron.GoalReminder" }).use(
  cron({
    name: "evening-goal-reminder",
    pattern: "0 19 * * *",
    async run() {
      try {
        const allPendingGoals = await db
          .select({
            userId: userSettings.userId,
            lang: userSettings.appLanguage,
            goalId: goals.id,
            goalName: goals.name,
            targetAmount: goals.amount,
            deadline: goals.deadline,
          })
          .from(goals)
          .innerJoin(userSettings, eq(goals.userId, userSettings.userId))
          .innerJoin(
            userFcmTokens,
            eq(userSettings.userId, userFcmTokens.userId)
          )
          .where(
            and(
              eq(goals.finished, false),
              eq(userSettings.isNotificationEnabled, true),
              isNull(goals.deletedAt)
            )
          );

        if (allPendingGoals.length === 0) return;

        const userGoalsGroup = new Map<number, typeof allPendingGoals>();
        for (const item of allPendingGoals) {
          const list = userGoalsGroup.get(item.userId) || [];
          userGoalsGroup.set(item.userId, [...list, item]);
        }

        const now = new Date();

        await Promise.allSettled(
          Array.from(userGoalsGroup.entries()).map(
            async ([userId, userGoals]) => {
              const processedGoals = await Promise.all(
                userGoals.map(async (g) => {
                  const [sumResult] = await db
                    .select({ total: sum(goalTransaction.amount) })
                    .from(goalTransaction)
                    .where(eq(goalTransaction.goalId, g.goalId));

                  const current = Number(sumResult?.total || 0);
                  const deadlineDate = g.deadline ? new Date(g.deadline) : null;

                  const daysLeft = deadlineDate
                    ? Math.ceil(
                        (deadlineDate.getTime() - now.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : null;

                  return {
                    ...g,
                    currentAmount: current,
                    percent: (current / g.targetAmount) * 100,
                    daysLeft,
                  };
                })
              );

              const bestGoalToRemind = processedGoals.sort((a, b) => {
                if (a.daysLeft !== null && a.daysLeft <= 7 && a.daysLeft >= 0)
                  return -1;
                if (b.daysLeft !== null && b.daysLeft <= 7 && b.daysLeft >= 0)
                  return 1;

                if (b.percent !== a.percent) return b.percent - a.percent;

                if (a.daysLeft !== null && b.daysLeft !== null)
                  return a.daysLeft - b.daysLeft;

                return 0;
              })[0];

              if (bestGoalToRemind) {
                return notificationService.sendTemplatedNotification(
                  userId,
                  bestGoalToRemind.lang as "th" | "en",
                  "GOAL_REMINDER",
                  {
                    goalName: bestGoalToRemind.goalName,
                    currentAmount: bestGoalToRemind.currentAmount,
                    targetAmount: bestGoalToRemind.targetAmount,
                  }
                );
              }
            }
          )
        );
      } catch (error) {
        console.error("[Goal Cron] Error:", error);
      }
    },
  })
);
