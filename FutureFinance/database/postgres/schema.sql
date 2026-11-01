-- =====================================================================
-- FutureFinance PostgreSQL Schema (3NF Normalized Academic Database)
-- Dialect: PostgreSQL 14+
-- =====================================================================

-- Clean slate (if re-running)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS simulation_runs CASCADE;
DROP TABLE IF EXISTS scenarios CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS financial_goals CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS income CASCADE;
DROP TABLE IF EXISTS financial_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS risk_tolerance_type CASCADE;
DROP TYPE IF EXISTS income_source_type CASCADE;
DROP TYPE IF EXISTS expense_category_type CASCADE;
DROP TYPE IF EXISTS investment_type_enum CASCADE;
DROP TYPE IF EXISTS risk_level_type CASCADE;
DROP TYPE IF EXISTS priority_type CASCADE;

-- Controlled Vocabularies
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE risk_tolerance_type AS ENUM ('low', 'moderate', 'high');
CREATE TYPE income_source_type AS ENUM ('Salary', 'Freelance', 'Business', 'Interest', 'Other');
CREATE TYPE expense_category_type AS ENUM ('Food', 'Transportation', 'Education', 'Entertainment', 'Shopping', 'Healthcare', 'Rent', 'Utilities', 'Other');
CREATE TYPE investment_type_enum AS ENUM ('Stocks', 'Mutual Funds', 'Fixed Deposits', 'Bonds', 'Gold', 'ETFs');
CREATE TYPE risk_level_type AS ENUM ('low', 'medium', 'high');
CREATE TYPE priority_type AS ENUM ('low', 'medium', 'high');

-- 1. Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Financial Profiles (1:1 with User)
CREATE TABLE financial_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    age SMALLINT CHECK (age IS NULL OR (age >= 18 AND age <= 120)),
    monthly_income NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (monthly_income >= 0),
    savings NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (savings >= 0),
    risk_tolerance risk_tolerance_type DEFAULT 'moderate',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Income Records
CREATE TABLE income (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source income_source_type NOT NULL,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    received_on DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT
);
CREATE INDEX ix_income_user_date ON income (user_id, received_on);

-- 4. Expenses Records
CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category expense_category_type NOT NULL,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    spent_on DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT
);
CREATE INDEX ix_expense_user_date ON expenses (user_id, spent_on);
CREATE INDEX ix_expense_category ON expenses (category);

-- 5. Investments Portfolio
CREATE TABLE investments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    investment_type investment_type_enum NOT NULL,
    amount_invested NUMERIC(14,2) NOT NULL CHECK (amount_invested > 0),
    current_value NUMERIC(14,2) NOT NULL CHECK (current_value >= 0),
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_return NUMERIC(5,2) DEFAULT 10.00,
    risk_level risk_level_type DEFAULT 'medium'
);
CREATE INDEX ix_investment_user_type ON investments (user_id, investment_type);

-- 6. Financial Goals
CREATE TABLE financial_goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    target_amount NUMERIC(14,2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    target_date DATE NOT NULL,
    priority priority_type DEFAULT 'medium'
);

-- 7. Loans and Liabilities
CREATE TABLE loans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lender VARCHAR(120) NOT NULL,
    outstanding_amount NUMERIC(14,2) NOT NULL CHECK (outstanding_amount >= 0),
    monthly_emi NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (monthly_emi >= 0)
);

-- 8. What-If Scenarios
CREATE TABLE scenarios (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    income_change_pct NUMERIC(6,2) DEFAULT 0,
    expense_change_pct NUMERIC(6,2) DEFAULT 0,
    contribution_change NUMERIC(14,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Monte Carlo Simulation Runs
CREATE TABLE simulation_runs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    initial_amount NUMERIC(14,2) NOT NULL,
    monthly_contribution NUMERIC(14,2) NOT NULL,
    annual_return NUMERIC(6,2) NOT NULL,
    volatility NUMERIC(6,2) NOT NULL,
    years INT NOT NULL,
    simulations INT NOT NULL,
    goal_target NUMERIC(14,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Database Audit Trail
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(20) NOT NULL,
    table_name VARCHAR(64) NOT NULL,
    record_id BIGINT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ix_audit_user_time ON audit_logs (user_id, created_at);
