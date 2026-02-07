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
} from "drizzle-orm/pg-core";

export const frequency = pgEnum("frequency_enum", [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
]);
export const transactionType = pgEnum("transaction_type_enum", [
  "INCOME",
  "EXPENSE",
]);

export const stock = pgTable(
  "stocks",
  {
    id: serial("id").primaryKey().notNull(),
    symbol: text("symbol").notNull(),
    name: text("name"),
    quoteType: text("quote_type"),
    currency: text("currency"),
    market: text("market"),
    description: text("description"),
    regularMarketPrice: doublePrecision("regular_market_price"),
    regularMarketOpen: doublePrecision("regular_market_open"),
    regularMarketHigh: doublePrecision("regular_market_high"),
    regularMarketLow: doublePrecision("regular_market_low"),
    previousClose: doublePrecision("previous_close"),
    dayHigh: doublePrecision("day_high"),
    dayLow: doublePrecision("day_low"),
    volume: bigint("volume", { mode: "bigint" }),
    averageVolume: bigint("average_volume", { mode: "bigint" }),
    fiftyDayAverage: doublePrecision("fifty_day_average"),
    twoHundredDayAverage: doublePrecision("two_hundred_day_average"),
    fiftyTwoWeekLow: doublePrecision("fifty_two_week_low"),
    fiftyTwoWeekHigh: doublePrecision("fifty_two_week_high"),
    fiftyTwoWeekChangePercent: doublePrecision("fifty_two_week_change_percent"),
    regularMarketChange: doublePrecision("regular_market_change"),
    regularMarketChangePercent: doublePrecision(
      "regular_market_change_percent"
    ),
    marketState: text("market_state"),
    tradeable: boolean("tradeable"),
    lastUpdated: timestamp("last_updated", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("stocks_symbol_idx").using(
      "btree",
      table.symbol.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("stocks_symbol_key").using(
      "btree",
      table.symbol.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const user = pgTable(
  "users",
  {
    id: serial("id").primaryKey().notNull(),
    email: text("email"),
    password: text("password"),
    name: text("name").notNull(),
    balance: doublePrecision("balance").default(0).notNull(),
    isEmailVerified: boolean("is_email_verified").default(false).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at", { precision: 3, mode: "date" }),
  },
  (table) => [
    uniqueIndex("users_email_key").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const oauthAccount = pgTable(
  "oauth_accounts",
  {
    id: serial("id").primaryKey().notNull(),
    provider: text("provider").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at", { precision: 3, mode: "date" }),
    userId: integer("user_id").notNull(),
  },
  (table) => [
    uniqueIndex("oauth_accounts_provider_provider_user_id_key").using(
      "btree",
      table.provider.asc().nullsLast().op("text_ops"),
      table.providerUserId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "oauth_accounts_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const passwordResetToken = pgTable(
  "password_reset_tokens",
  {
    id: serial("id").primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
    used: boolean("used").default(false).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("password_reset_tokens_token_hash_key").using(
      "btree",
      table.tokenHash.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "password_reset_tokens_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const refreshToken = pgTable(
  "refresh_tokens",
  {
    id: serial("id").primaryKey().notNull(),
    tokenHash: text("token_hash").notNull(),
    revoked: boolean("revoked").default(false).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
    userId: integer("user_id").notNull(),
  },
  (table) => [
    uniqueIndex("refresh_tokens_token_hash_key").using(
      "btree",
      table.tokenHash.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "refresh_tokens_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const emailVerification = pgTable(
  "email_verifications",
  {
    id: serial("id").primaryKey().notNull(),
    otpHash: text("otp_hash").notNull(),
    expiresAt: timestamp("expires_at", {
      precision: 3,
      mode: "date",
    }).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    userId: integer("user_id").notNull(),
  },
  (table) => [
    uniqueIndex("email_verifications_otp_hash_key").using(
      "btree",
      table.otpHash.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "email_verifications_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const category = pgTable(
  "categories",
  {
    id: serial("id").primaryKey().notNull(),
    name: text("name").notNull(),
    type: transactionType("type").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at", { precision: 3, mode: "date" }),
    userId: integer("user_id"),
    iconId: integer("icon_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.iconId],
      foreignColumns: [icon.id],
      name: "categories_icon_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "categories_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const transaction = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey().notNull(),
    type: transactionType("type"),
    description: text("description"),
    amount: doublePrecision("amount").notNull(),
    receipt: text("receipt"),
    toAccount: text("to_account"),
    fromAccount: text("from_account"),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at", { precision: 3, mode: "date" }),
    userId: integer("user_id").notNull(),
    categoryId: integer("category_id").notNull(),
  },
  (table) => [
    index("idx_transactions_user_created_at").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops"),
      table.createdAt.asc().nullsLast().op("int4_ops")
    ),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [category.id],
      name: "transactions_category_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "transactions_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const icon = pgTable(
  "icons",
  {
    id: serial("id").primaryKey().notNull(),
    url: text("url").notNull().unique(),
    description: text("description"),
    userId: integer("user_id"),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "icons_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const goals = pgTable(
  "goals",
  {
    id: serial("id").primaryKey().notNull(),
    name: text("name").notNull(),
    amount: doublePrecision("amount").notNull(),
    finished: boolean("finished").default(false).notNull(),
    deadline: timestamp("deadline", { precision: 3, mode: "date" }),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at", { precision: 3, mode: "date" }),
    userId: integer("user_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "goals_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const goalTransaction = pgTable(
  "goal_transactions",
  {
    id: serial("id").primaryKey().notNull(),
    goalId: integer("goal_id").notNull(),
    userId: integer("user_id").notNull(),
    amount: doublePrecision("amount").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.goalId],
      foreignColumns: [goals.id],
      name: "goal_transactions_goal_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ]
);

export const budgets = pgTable(
  "budgets",
  {
    id: serial("id").primaryKey().notNull(),
    amount: doublePrecision("amount").notNull(),
    currentAmount: doublePrecision("current_amount").default(0).notNull(),
    categoryId: integer("category_id").notNull(),
    frequency: frequency("frequency").notNull(),
    deadline: timestamp("deadline", { precision: 3, mode: "date" }),
    userId: integer("user_id").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at", { precision: 3, mode: "date" }),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "budgets_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [category.id],
      name: "budgets_category_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const chatSession = pgTable(
  "chat_sessions",
  {
    id: serial("id").primaryKey().notNull(),
    title: text("title").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    userId: integer("user_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "chat_sessions_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const chatMessage = pgTable(
  "chat_messages",
  {
    id: serial("id").primaryKey().notNull(),
    role: text("role").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    userId: integer("user_id").notNull(),
    sessionId: integer("session_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [chatSession.id],
      name: "chat_messages_session_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "chat_messages_user_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);
