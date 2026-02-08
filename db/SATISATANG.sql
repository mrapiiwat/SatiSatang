CREATE TYPE public.frequency_enum AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

CREATE TYPE public.transaction_type_enum AS ENUM ('INCOME', 'EXPENSE');

CREATE
OR REPLACE FUNCTION update_updated_at_column () RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE
  public.users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT NOT NULL,
    balance DOUBLE PRECISION NOT NULL DEFAULT 0,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
  );

CREATE TABLE
  public.oauth_accounts (
    id SERIAL PRIMARY KEY,
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    user_id INT NOT NULL,
    UNIQUE (provider, provider_user_id),
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
  );

CREATE TABLE
  public.password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
  );

CREATE TABLE
  public.refresh_tokens (
    id SERIAL PRIMARY KEY,
    token_hash TEXT NOT NULL UNIQUE,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
  );

CREATE TABLE
  public.email_verifications (
    id SERIAL PRIMARY KEY,
    otp_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
  );

CREATE TABLE
  public.stocks (
    id SERIAL PRIMARY KEY,
    symbol TEXT NOT NULL UNIQUE,
    name TEXT,
    quote_type TEXT,
    currency TEXT,
    market TEXT,
    description TEXT,
    regular_market_price DOUBLE PRECISION,
    regular_market_open DOUBLE PRECISION,
    regular_market_high DOUBLE PRECISION,
    regular_market_low DOUBLE PRECISION,
    previous_close DOUBLE PRECISION,
    day_high DOUBLE PRECISION,
    day_low DOUBLE PRECISION,
    volume BIGINT,
    average_volume BIGINT,
    fifty_day_average DOUBLE PRECISION,
    two_hundred_day_average DOUBLE PRECISION,
    fifty_two_week_low DOUBLE PRECISION,
    fifty_two_week_high DOUBLE PRECISION,
    fifty_two_week_change_percent DOUBLE PRECISION,
    regular_market_change DOUBLE PRECISION,
    regular_market_change_percent DOUBLE PRECISION,
    market_state TEXT,
    tradeable BOOLEAN,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  public.icons (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,
    description TEXT,
    user_id INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
  );

CREATE TABLE
  public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type public.transaction_type_enum NOT NULL,
    user_id INT,
    icon_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE,
    FOREIGN KEY (icon_id) REFERENCES public.icons (id) ON DELETE CASCADE
  );

CREATE TABLE
  public.transactions (
    id SERIAL PRIMARY KEY,
    type public.transaction_type_enum,
    description TEXT,
    amount DOUBLE PRECISION NOT NULL,
    receipt TEXT,
    to_account TEXT,
    from_account TEXT,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES public.categories (id) ON DELETE CASCADE
  );

CREATE INDEX idx_transactions_user_created_at ON public.transactions (user_id, created_at);

CREATE TABLE
  public.goals (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    finished BOOLEAN NOT NULL DEFAULT FALSE,
    deadline TIMESTAMP,
    user_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
  );

CREATE TABLE
  public.goal_transactions (
    id SERIAL PRIMARY KEY,
    goal_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (goal_id) REFERENCES public.goals (id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
  );

CREATE TABLE
  public.budgets (
    id SERIAL PRIMARY KEY,
    amount DOUBLE PRECISION NOT NULL,
    current_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    category_id INT NOT NULL,
    frequency public.frequency_enum NOT NULL,
    deadline TIMESTAMP,
    user_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES public.categories (id) ON DELETE CASCADE
  );

CREATE TABLE
  public.chat_sessions (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
  );

CREATE TABLE
  public.chat_messages (
    id SERIAL PRIMARY KEY,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    session_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES public.chat_sessions (id) ON DELETE CASCADE
  );

CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_stocks_updated_at BEFORE
UPDATE ON public.stocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_icons_updated_at BEFORE
UPDATE ON public.icons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_categories_updated_at BEFORE
UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_transactions_updated_at BEFORE
UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_goals_updated_at BEFORE
UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_budgets_updated_at BEFORE
UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE
UPDATE ON public.chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column ();

CREATE TRIGGER update_chat_messages_updated_at BEFORE
UPDATE ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column ();