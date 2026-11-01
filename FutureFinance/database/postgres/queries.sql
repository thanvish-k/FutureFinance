-- =====================================================================
-- FutureFinance PostgreSQL Evaluation & Demonstration Queries
-- =====================================================================

-- 1. Monthly Category Breakdown with GROUP BY and HAVING
SELECT category, SUM(amount) AS total_spent
FROM expenses 
WHERE user_id = 1 AND spent_on >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY category 
ORDER BY total_spent DESC;

-- 2. Subquery / Join: Users below recommended savings rate (< 20%)
SELECT u.id, u.name, u.email, h.savings_rate, h.monthly_income, h.expenses
FROM users u 
JOIN financial_health_summary h ON h.user_id = u.id 
WHERE h.savings_rate < 20.0;

-- 3. Deficit Detection: Months where expenses exceeded income
SELECT user_id, month, monthly_income, monthly_expenses, (monthly_income - monthly_expenses) AS deficit
FROM monthly_financial_summary 
WHERE monthly_expenses > monthly_income;

-- 4. Portfolio Allocation and Window Function calculation
SELECT 
    user_id,
    investment_type,
    portfolio_value,
    allocation_pct,
    DENSE_RANK() OVER(PARTITION BY user_id ORDER BY portfolio_value DESC) AS rank_by_value
FROM investment_portfolio_summary 
WHERE user_id = 1;

-- 5. Stored Procedure invocation: Category Expense Report
SELECT * FROM generate_expense_report(1);

-- 6. Window Function CTE: Highest single spending category per user
WITH ranked_expenses AS (
    SELECT 
        user_id,
        category,
        SUM(amount) AS total,
        DENSE_RANK() OVER(PARTITION BY user_id ORDER BY SUM(amount) DESC) AS rank
    FROM expenses 
    GROUP BY user_id, category
) 
SELECT user_id, category, total
FROM ranked_expenses 
WHERE rank = 1;

-- 7. Atomic Transaction with Audit Trigger verification
BEGIN;
INSERT INTO expenses (user_id, category, amount, spent_on, description)
VALUES (1, 'Food', 450.00, CURRENT_DATE, 'Evaluation test transaction');
-- Audit log was automatically inserted via trigger!
SELECT * FROM audit_logs WHERE table_name = 'expenses' ORDER BY id DESC LIMIT 1;
COMMIT;
