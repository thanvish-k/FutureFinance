-- =====================================================================
-- FutureFinance PostgreSQL Reporting Views
-- =====================================================================

-- 1. Monthly Financial Summary (Income vs Expense aggregations per month)
CREATE OR REPLACE VIEW monthly_financial_summary AS
SELECT 
    u.id AS user_id,
    TO_CHAR(i.received_on, 'YYYY-MM') AS month,
    SUM(i.amount) AS monthly_income,
    COALESCE(
        (SELECT SUM(e.amount) 
         FROM expenses e 
         WHERE e.user_id = u.id 
           AND TO_CHAR(e.spent_on, 'YYYY-MM') = TO_CHAR(i.received_on, 'YYYY-MM')
        ), 0
    ) AS monthly_expenses
FROM users u
JOIN income i ON i.user_id = u.id
GROUP BY u.id, TO_CHAR(i.received_on, 'YYYY-MM');

-- 2. Investment Portfolio Summary (Allocation percentage per asset class)
CREATE OR REPLACE VIEW investment_portfolio_summary AS
SELECT 
    user_id,
    investment_type,
    SUM(current_value) AS portfolio_value,
    ROUND(
        (SUM(current_value) / NULLIF(SUM(SUM(current_value)) OVER(PARTITION BY user_id), 0) * 100)::numeric, 
        2
    ) AS allocation_pct
FROM investments
GROUP BY user_id, investment_type;

-- 3. Goal Progress Summary (Completion %, remaining amount)
CREATE OR REPLACE VIEW goal_progress_summary AS
SELECT 
    id,
    user_id,
    name,
    target_amount,
    current_amount,
    ROUND((current_amount / NULLIF(target_amount, 0) * 100)::numeric, 2) AS progress_pct,
    GREATEST(0, target_amount - current_amount) AS remaining
FROM financial_goals;

-- 4. Expense Category Summary (Monthly breakdown by category)
CREATE OR REPLACE VIEW expense_category_summary AS
SELECT 
    user_id,
    TO_CHAR(spent_on, 'YYYY-MM') AS month,
    category,
    SUM(amount) AS amount
FROM expenses
GROUP BY user_id, TO_CHAR(spent_on, 'YYYY-MM'), category;

-- 5. Financial Health Summary
CREATE OR REPLACE VIEW financial_health_summary AS
SELECT 
    p.user_id,
    p.savings,
    p.monthly_income,
    COALESCE(e.expenses, 0) AS expenses,
    ROUND(
        ((p.monthly_income - COALESCE(e.expenses, 0)) / NULLIF(p.monthly_income, 0) * 100)::numeric,
        2
    ) AS savings_rate
FROM financial_profiles p
LEFT JOIN (
    SELECT user_id, SUM(amount) AS expenses
    FROM expenses
    WHERE spent_on >= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY user_id
) e ON e.user_id = p.user_id;
