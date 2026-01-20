import { and, desc, eq, gte, lte, type SQL } from "drizzle-orm";
import { BadRequestError, NotFoundError } from "@/common/errors";
import { db } from "@/db";
import { goals, transaction, user } from "@/db/schema";
import type * as userSchema from "./user.schema";

export class UserService {
  async me(userId: number) {
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId),
      with: {
        oauthAccounts: true,
      },
    });

    if (!userRecord) throw new NotFoundError("Not found");

    const responseData = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      balance: userRecord.balance,
      oauthAccounts: userRecord.oauthAccounts,
    };

    return responseData;
  }

  async changePassword(userId: number, data: userSchema.password) {
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        id: true,
        password: true,
      },
    });

    if (!userRecord) throw new NotFoundError("User not found");

    const isPasswordValid = await Bun.password.verify(
      data.oldPassword,
      userRecord.password || ""
    );

    if (!isPasswordValid) {
      throw new BadRequestError("Old password is incorrect");
    }

    const isSameAsOld = await Bun.password.verify(
      data.password,
      userRecord.password || ""
    );
    if (isSameAsOld) {
      throw new BadRequestError(
        "New password cannot be the same as the old password"
      );
    }
    const hashedPassword = await Bun.password.hash(data.password);

    await db
      .update(user)
      .set({ password: hashedPassword })
      .where(eq(user.id, userId));

    return { message: "Password updated successfully" };
  }

  async updateName(data: userSchema.name, userId: number) {
    const [updatedUser] = await db
      .update(user)
      .set({ name: data.name })
      .where(eq(user.id, userId))
      .returning();

    return updatedUser.name;
  }

  async getSummary(userId: number, query: userSchema.getSummaryQuery) {
    const { month, year } = query;

    let startDate: Date | undefined;
    let endDate: Date | undefined;
    const transactionConditions: SQL[] = [eq(transaction.userId, userId)];

    if (month && year) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);

      transactionConditions.push(gte(transaction.createdAt, startDate));
      transactionConditions.push(lte(transaction.createdAt, endDate));
    }

    const transactionsData = await db.query.transaction.findMany({
      where: and(...transactionConditions),
      with: { category: true },
      orderBy: [desc(transaction.createdAt)],
    });

    const goalsData = await db.query.goals.findMany({
      where: eq(goals.userId, userId),
      with: { goalTransactions: true },
      orderBy: [desc(goals.createdAt)],
    });

    const goalsWithCurrentAmount = goalsData.map((goal) => {
      let currentAmount = 0;

      goal.goalTransactions.forEach((gt) => {
        const gtDate = new Date(gt.createdAt);
        if (
          (!startDate || gtDate >= startDate) &&
          (!endDate || gtDate <= endDate)
        ) {
          currentAmount += Number(gt.amount);
        }
      });

      return {
        ...goal,
        amount: Number(goal.amount),
        currentAmount,
      };
    });

    const totalIncome = transactionsData
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactionsData
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpense;

    const totalGoalAmount = goalsWithCurrentAmount.reduce(
      (sum, g) => sum + g.amount,
      0
    );
    const totalCurrentAmount = goalsWithCurrentAmount.reduce(
      (sum, g) => sum + g.currentAmount,
      0
    );

    const formattedTransactions = transactionsData.map((t) => ({
      ...t,
      amount: Number(t.amount),
      receipt: t.receipt
        ? `${Bun.env.APP_BASE_URL}/api/transactions/receipt/${t.id}`
        : null,
    }));

    return {
      summary: {
        totalIncome,
        totalExpense,
        balance,
        goalsSummary: {
          totalGoals: goalsWithCurrentAmount.length,
          totalGoalAmount,
          totalCurrentAmount,
        },
      },
      transactions: formattedTransactions,
      goals: goalsWithCurrentAmount,
    };
  }
}
