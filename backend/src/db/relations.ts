import { relations } from "drizzle-orm/relations";
import {
  budgets,
  category,
  chatMessage,
  chatSession,
  emailVerification,
  goals,
  goalTransaction,
  icon,
  oauthAccount,
  passwordResetToken,
  refreshToken,
  transaction,
  user,
  userConsents,
} from "./schema";

export const oauthAccountRelations = relations(oauthAccount, ({ one }) => ({
  user: one(user, {
    fields: [oauthAccount.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  oauthAccounts: many(oauthAccount),
  passwordResetTokens: many(passwordResetToken),
  refreshTokens: many(refreshToken),
  emailVerifications: many(emailVerification),
  categories: many(category),
  transactions: many(transaction),
  icons: many(icon),
  goals: many(goals),
  budgets: many(budgets),
  chatSessions: many(chatSession),
  chatMessages: many(chatMessage),
  userConsents: many(userConsents),
}));

export const passwordResetTokenRelations = relations(
  passwordResetToken,
  ({ one }) => ({
    user: one(user, {
      fields: [passwordResetToken.userId],
      references: [user.id],
    }),
  })
);

export const refreshTokenRelations = relations(refreshToken, ({ one }) => ({
  user: one(user, {
    fields: [refreshToken.userId],
    references: [user.id],
  }),
}));

export const emailVerificationRelations = relations(
  emailVerification,
  ({ one }) => ({
    user: one(user, {
      fields: [emailVerification.userId],
      references: [user.id],
    }),
  })
);

export const categoryRelations = relations(category, ({ one, many }) => ({
  icon: one(icon, {
    fields: [category.iconId],
    references: [icon.id],
  }),
  user: one(user, {
    fields: [category.userId],
    references: [user.id],
  }),
  transactions: many(transaction),
  budgets: many(budgets),
}));

export const iconRelations = relations(icon, ({ one, many }) => ({
  categories: many(category),
  user: one(user, {
    fields: [icon.userId],
    references: [user.id],
  }),
}));

export const transactionRelations = relations(transaction, ({ one }) => ({
  category: one(category, {
    fields: [transaction.categoryId],
    references: [category.id],
  }),
  user: one(user, {
    fields: [transaction.userId],
    references: [user.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(user, {
    fields: [goals.userId],
    references: [user.id],
  }),
  goalTransactions: many(goalTransaction),
}));

export const goalTransactionRelations = relations(
  goalTransaction,
  ({ one }) => ({
    goal: one(goals, {
      fields: [goalTransaction.goalId],
      references: [goals.id],
    }),
  })
);

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(user, {
    fields: [budgets.userId],
    references: [user.id],
  }),
  category: one(category, {
    fields: [budgets.categoryId],
    references: [category.id],
  }),
}));

export const chatSessionRelations = relations(chatSession, ({ one, many }) => ({
  user: one(user, {
    fields: [chatSession.userId],
    references: [user.id],
  }),
  chatMessages: many(chatMessage),
}));

export const chatMessageRelations = relations(chatMessage, ({ one }) => ({
  chatSession: one(chatSession, {
    fields: [chatMessage.sessionId],
    references: [chatSession.id],
  }),
  user: one(user, {
    fields: [chatMessage.userId],
    references: [user.id],
  }),
}));

export const userConsentsRelations = relations(userConsents, ({ one }) => ({
  user: one(user, {
    fields: [userConsents.userId],
    references: [user.id],
  }),
}));
