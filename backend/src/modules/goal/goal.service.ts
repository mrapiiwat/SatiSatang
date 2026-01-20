import { and, desc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { BadRequestError, NotFoundError } from "@/common/errors";
import { db } from "@/db";
import { goals } from "@/db/schema";
import type * as goalSchema from "./goal.schema";

export class GoalService {
  async createGoal(userId: number, data: goalSchema.createGoal) {
    let deadlineDate: Date | null = null;

    if (data.deadline) {
      deadlineDate = new Date(data.deadline);
      const now = new Date();

      if (deadlineDate < now) {
        throw new BadRequestError("Deadline cannot be in the past");
      }
    }

    const [newGoal] = await db
      .insert(goals)
      .values({
        name: data.name,
        amount: data.amount,
        deadline: deadlineDate,
        userId: userId,
      })
      .returning();

    return newGoal;
  }
  async getGoals(
    userId: number,
    query: { month?: number; year?: number; isFinished?: boolean }
  ) {
    const { month, year, isFinished } = query;
    const now = new Date();
    const startDate =
      month && year
        ? new Date(year, month - 1, 1)
        : new Date(now.getFullYear(), now.getMonth(), 1);

    const endDate =
      month && year
        ? new Date(year, month, 0, 23, 59, 59, 999)
        : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const rawGoals = await db.query.goals.findMany({
      where: and(
        eq(goals.userId, userId),
        lte(goals.createdAt, endDate),
        or(gte(goals.deadline, startDate), isNull(goals.deadline))
      ),
      with: {
        goalTransactions: true,
      },
      orderBy: [desc(goals.createdAt)],
    });

    const goalsWithAmounts = await Promise.all(
      rawGoals.map(async (goal) => {
        const totalAmount = goal.goalTransactions.reduce(
          (sum, gt) => sum + Number(gt.amount),
          0
        );

        const currentAmount = goal.goalTransactions
          .filter((gt) => {
            const date = new Date(gt.createdAt);
            return date >= startDate && date <= endDate;
          })
          .reduce((sum, gt) => sum + Number(gt.amount), 0);

        let isGoalFinished = goal.finished;

        if (!isGoalFinished && totalAmount >= Number(goal.amount)) {
          await db
            .update(goals)
            .set({ finished: true })
            .where(eq(goals.id, goal.id));

          isGoalFinished = true;
        }

        return {
          ...goal,
          finished: isGoalFinished,
          amount: Number(goal.amount),
          totalAmount,
          currentAmount,
        };
      })
    );

    const filteredGoals = goalsWithAmounts.filter((goal) =>
      isFinished === undefined ? true : goal.finished === isFinished
    );

    const totalGoalAmount = filteredGoals.reduce((sum, g) => sum + g.amount, 0);
    const totalCurrentAmount = filteredGoals.reduce(
      (sum, g) => sum + g.currentAmount,
      0
    );

    return {
      data: filteredGoals,
      summary: {
        totalGoals: filteredGoals.length,
        totalGoalAmount,
        totalCurrentAmount,
      },
    };
  }

  async updateGoal(
    userId: number,
    goalId: number,
    data: goalSchema.updateGoal
  ) {
    const existingGoal = await db.query.goals.findFirst({
      where: and(eq(goals.id, goalId), eq(goals.userId, userId)),
    });

    if (!existingGoal) {
      throw new NotFoundError("Goal not found");
    }

    let newDeadline = existingGoal.deadline;

    if (data.deadline) {
      const parsedDate = new Date(data.deadline);
      const now = new Date();

      if (parsedDate < now) {
        throw new BadRequestError("Deadline cannot be in the past");
      }
      newDeadline = parsedDate;
    }

    const [updatedGoal] = await db
      .update(goals)
      .set({
        name: data.name ?? existingGoal.name,
        amount: data.amount ?? existingGoal.amount,
        deadline: newDeadline,
      })
      .where(eq(goals.id, goalId))
      .returning();

    return updatedGoal;
  }
  async deleteGoal(userId: number, goalId: number) {
    const existingGoal = await db.query.goals.findFirst({
      where: and(eq(goals.id, goalId), eq(goals.userId, userId)),
    });

    if (!existingGoal) {
      throw new NotFoundError("Goal not found");
    }

    await db.delete(goals).where(eq(goals.id, goalId));

    return { message: "Goal deleted successfully" };
  }
}
