import {
  bigint,
  boolean,
  doublePrecision,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const frequency = pgEnum("Frequency", [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
]);
export const transactionType = pgEnum("TransactionType", ["INCOME", "EXPENSE"]);

export const prismaMigrations = pgTable("_prisma_migrations", {
  id: varchar({ length: 36 }).primaryKey().notNull(),
  checksum: varchar({ length: 64 }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true, mode: "date" }),
  migrationName: varchar("migration_name", { length: 255 }).notNull(),
  logs: text(),
  rolledBackAt: timestamp("rolled_back_at", {
    withTimezone: true,
    mode: "date",
  }),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const stock = pgTable(
  "Stock",
  {
    id: serial().primaryKey().notNull(),
    symbol: text().notNull(),
    name: text(),
    quoteType: text(),
    currency: text(),
    market: text(),
    description: text(),
    regularMarketPrice: doublePrecision(),
    regularMarketOpen: doublePrecision(),
    regularMarketHigh: doublePrecision(),
    regularMarketLow: doublePrecision(),
    previousClose: doublePrecision(),
    dayHigh: doublePrecision(),
    dayLow: doublePrecision(),
    volume: bigint({ mode: "bigint" }),
    averageVolume: bigint({ mode: "bigint" }),
    fiftyDayAverage: doublePrecision(),
    twoHundredDayAverage: doublePrecision(),
    fiftyTwoWeekLow: doublePrecision(),
    fiftyTwoWeekHigh: doublePrecision(),
    fiftyTwoWeekChangePercent: doublePrecision(),
    regularMarketChange: doublePrecision(),
    regularMarketChangePercent: doublePrecision(),
    marketState: text(),
    tradeable: boolean(),
    lastUpdated: timestamp("lastUpdated", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("Stock_symbol_idx").using(
      "btree",
      table.symbol.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("Stock_symbol_key").using(
      "btree",
      table.symbol.asc().nullsLast().op("text_ops")
    ),
    index("Stock_symbol_lastUpdated_idx").using(
      "btree",
      table.symbol.asc().nullsLast().op("text_ops"),
      table.lastUpdated.asc().nullsLast().op("timestamp_ops")
    ),
  ]
);

export const user = pgTable(
  "User",
  {
    id: serial().primaryKey().notNull(),
    email: text(),
    password: text(),
    name: text().notNull(),
    balance: doublePrecision().default(0).notNull(),
    isEmailVerified: boolean().default(false).notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("User_email_key").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops")
    ),
    index("User_id_email_idx").using(
      "btree",
      table.id.asc().nullsLast().op("int4_ops"),
      table.email.asc().nullsLast().op("int4_ops")
    ),
  ]
);

export const oauthAccount = pgTable(
  "OAuthAccount",
  {
    id: serial().primaryKey().notNull(),
    provider: text().notNull(),
    providerUserId: text().notNull(),
    accessToken: text(),
    refreshToken: text(),
    expiresAt: timestamp("expiresAt", { precision: 3, mode: "date" }),
    userId: integer().notNull(),
  },
  (table) => [
    uniqueIndex("OAuthAccount_provider_providerUserId_key").using(
      "btree",
      table.provider.asc().nullsLast().op("text_ops"),
      table.providerUserId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "OAuthAccount_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const passwordResetToken = pgTable(
  "PasswordResetToken",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    tokenHash: text().notNull(),
    expiresAt: timestamp("expiresAt", { precision: 3, mode: "date" }).notNull(),
    used: boolean().default(false).notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("PasswordResetToken_tokenHash_idx").using(
      "btree",
      table.tokenHash.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("PasswordResetToken_tokenHash_key").using(
      "btree",
      table.tokenHash.asc().nullsLast().op("text_ops")
    ),
    index("PasswordResetToken_userId_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "PasswordResetToken_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const refreshToken = pgTable(
  "RefreshToken",
  {
    id: serial().primaryKey().notNull(),
    tokenHash: text().notNull(),
    revoked: boolean().default(false).notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expiresAt", { precision: 3, mode: "date" }).notNull(),
    userId: integer().notNull(),
  },
  (table) => [
    uniqueIndex("RefreshToken_tokenHash_key").using(
      "btree",
      table.tokenHash.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "RefreshToken_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const emailVerification = pgTable(
  "EmailVerification",
  {
    id: serial().primaryKey().notNull(),
    otpHash: text().notNull(),
    expiresAt: timestamp("expiresAt", { precision: 3, mode: "date" }).notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    userId: integer().notNull(),
  },
  (table) => [
    uniqueIndex("EmailVerification_otpHash_key").using(
      "btree",
      table.otpHash.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "EmailVerification_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const category = pgTable(
  "Category",
  {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
    type: transactionType().notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    userId: integer(),
    iconId: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.iconId],
      foreignColumns: [icon.id],
      name: "Category_iconId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Category_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const transaction = pgTable(
  "Transaction",
  {
    id: serial().primaryKey().notNull(),
    type: transactionType(),
    description: text(),
    amount: doublePrecision().notNull(),
    receipt: text(),
    toAccount: text(),
    fromAccount: text(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    userId: integer().notNull(),
    categoryId: integer().notNull(),
  },
  (table) => [
    index("Transaction_userId_createdAt_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops"),
      table.createdAt.asc().nullsLast().op("int4_ops")
    ),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [category.id],
      name: "Transaction_categoryId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Transaction_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const icon = pgTable(
  "Icon",
  {
    id: serial().primaryKey().notNull(),
    url: text().notNull(),
    description: text(),
    userId: integer(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Icon_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const goals = pgTable(
  "Goals",
  {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
    amount: doublePrecision().notNull(),
    finished: boolean().default(false).notNull(),
    deadline: timestamp("deadline", { precision: 3, mode: "date" }),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    userId: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Goals_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const goalTransaction = pgTable(
  "GoalTransaction",
  {
    id: serial().primaryKey().notNull(),
    goalId: integer().notNull(),
    userId: integer().notNull(),
    amount: doublePrecision().notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.goalId],
      foreignColumns: [goals.id],
      name: "GoalTransaction_goalId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ]
);

export const budgets = pgTable(
  "Budgets",
  {
    id: serial().primaryKey().notNull(),
    amount: doublePrecision().notNull(),
    currentAmount: doublePrecision().default(0).notNull(),
    categoryId: integer().notNull(),
    frequency: frequency().notNull(),
    deadline: timestamp("deadline", { precision: 3, mode: "date" }),
    userId: integer().notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Budgets_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [category.id],
      name: "Budgets_categoryId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const chatSession = pgTable(
  "ChatSession",
  {
    id: serial().primaryKey().notNull(),
    title: text().notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    userId: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "ChatSession_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const chatMessage = pgTable(
  "ChatMessage",
  {
    id: serial().primaryKey().notNull(),
    role: text().notNull(),
    content: text().notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    userId: integer().notNull(),
    sessionId: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [chatSession.id],
      name: "ChatMessage_sessionId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "ChatMessage_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);
