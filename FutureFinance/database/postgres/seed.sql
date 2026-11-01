-- =====================================================================
-- FutureFinance PostgreSQL Seed Data
-- =====================================================================

-- Password for all seed users is: FutureFinance@123
INSERT INTO users (name, email, password_hash, role) VALUES
('Demo User', 'demo@futurefinance.in', '$2b$12$9bT.VyP/Wv2wJrRwTjwVDeXwjrJQqkTRkjizM0EjuE6iaoeVH52vO', 'user'),
('Aarav Sharma', 'aarav@example.in', '$2b$12$9bT.VyP/Wv2wJrRwTjwVDeXwjrJQqkTRkjizM0EjuE6iaoeVH52vO', 'user'),
('Diya Patel', 'diya@example.in', '$2b$12$9bT.VyP/Wv2wJrRwTjwVDeXwjrJQqkTRkjizM0EjuE6iaoeVH52vO', 'user'),
('Kabir Singh', 'kabir@example.in', '$2b$12$9bT.VyP/Wv2wJrRwTjwVDeXwjrJQqkTRkjizM0EjuE6iaoeVH52vO', 'user'),
('Meera Iyer', 'meera@example.in', '$2b$12$9bT.VyP/Wv2wJrRwTjwVDeXwjrJQqkTRkjizM0EjuE6iaoeVH52vO', 'user');

INSERT INTO financial_profiles (user_id, age, monthly_income, savings, risk_tolerance) VALUES
(1, 28, 100000.00, 180000.00, 'moderate'),
(2, 31, 110000.00, 420000.00, 'high'),
(3, 25, 60000.00, 90000.00, 'moderate'),
(4, 35, 145000.00, 700000.00, 'low'),
(5, 29, 75000.00, 125000.00, 'moderate');

INSERT INTO income (user_id, source, amount, received_on, description) VALUES
(1, 'Salary', 85000.00, CURRENT_DATE, 'Primary tech employment'),
(1, 'Freelance', 15000.00, CURRENT_DATE, 'Consulting & software advisory'),
(2, 'Salary', 110000.00, CURRENT_DATE, 'Corporate salary'),
(3, 'Salary', 60000.00, CURRENT_DATE, 'Design retainer'),
(4, 'Business', 145000.00, CURRENT_DATE, 'Agency distribution'),
(5, 'Salary', 75000.00, CURRENT_DATE, 'Analytics salary');

INSERT INTO expenses (user_id, category, amount, spent_on, description) VALUES
(1, 'Rent', 25000.00, CURRENT_DATE, 'Apartment lease'),
(1, 'Food', 9000.00, CURRENT_DATE, 'Groceries & provisions'),
(1, 'Entertainment', 6000.00, CURRENT_DATE, 'Subscriptions & weekend dining'),
(1, 'Utilities', 4500.00, CURRENT_DATE, 'Electricity, fiber broadband'),
(2, 'Rent', 30000.00, CURRENT_DATE, 'Suburban lease'),
(3, 'Transportation', 6500.00, CURRENT_DATE, 'Commuting fuel and metro'),
(4, 'Shopping', 12000.00, CURRENT_DATE, 'Household refurbish'),
(5, 'Utilities', 5000.00, CURRENT_DATE, 'Utility services');

INSERT INTO investments (user_id, name, investment_type, amount_invested, current_value, purchase_date, expected_return, risk_level) VALUES
(1, 'Nifty 50 Index Fund', 'Mutual Funds', 120000.00, 142000.00, '2023-01-15', 11.50, 'medium'),
(1, 'SGB Sovereign Gold', 'Gold', 50000.00, 58000.00, '2023-05-01', 8.00, 'low'),
(1, 'Bluechip Large Cap ETF', 'ETFs', 80000.00, 95000.00, '2023-03-10', 12.00, 'high'),
(2, 'Tech Leaders ETF', 'ETFs', 300000.00, 340000.00, '2022-08-01', 12.00, 'high'),
(3, 'Fixed Deposit Cumulative', 'Fixed Deposits', 50000.00, 54000.00, '2024-01-01', 7.00, 'low'),
(4, 'Govt Infrastructure Bonds', 'Bonds', 250000.00, 260000.00, '2023-02-01', 7.20, 'low');

INSERT INTO financial_goals (user_id, name, target_amount, current_amount, target_date, priority) VALUES
(1, 'Emergency Fund (6mo)', 400000.00, 180000.00, '2028-01-01', 'high'),
(1, 'Europe Study Travel', 300000.00, 60000.00, '2027-06-01', 'medium'),
(1, 'Apartment Down Payment', 2500000.00, 600000.00, '2031-01-01', 'high'),
(2, 'House Down Payment', 2500000.00, 600000.00, '2031-01-01', 'high'),
(3, 'High Performance Workstation', 120000.00, 45000.00, '2027-01-01', 'medium'),
(4, 'Retirement Corpus', 15000000.00, 1200000.00, '2045-01-01', 'high');

INSERT INTO loans (user_id, lender, outstanding_amount, monthly_emi) VALUES
(1, 'HDFC Bank Personal Loan', 180000.00, 8500.00),
(2, 'ICICI Car Loan', 450000.00, 18000.00),
(5, 'SBI Education Loan', 120000.00, 6000.00);

INSERT INTO scenarios (user_id, name, expense_change_pct, contribution_change) VALUES
(1, 'Discretionary Cut 10%', -10.00, 0.00),
(1, 'Accelerated SIP +₹5,000', 0.00, 5000.00),
(2, 'Promotion Scenario +15% Income', 15.00, 7500.00);
