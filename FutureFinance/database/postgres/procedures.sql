-- =====================================================================
-- FutureFinance PostgreSQL Stored Functions and Procedures
-- =====================================================================

-- 1. Monthly Financial Summary for a specific user
CREATE OR REPLACE FUNCTION calculate_monthly_financial_summary(p_user_id BIGINT)
RETURNS TABLE (
    user_id BIGINT,
    month TEXT,
    monthly_income NUMERIC,
    monthly_expenses NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.user_id, m.month, m.monthly_income, m.monthly_expenses
    FROM monthly_financial_summary m
    WHERE m.user_id = p_user_id
    ORDER BY m.month DESC;
END;
$$ LANGUAGE plpgsql;

-- 2. Goal Progress with required monthly savings
CREATE OR REPLACE FUNCTION calculate_goal_progress(p_user_id BIGINT)
RETURNS TABLE (
    id BIGINT,
    user_id BIGINT,
    name VARCHAR(120),
    target_amount NUMERIC,
    current_amount NUMERIC,
    progress_pct NUMERIC,
    remaining NUMERIC,
    required_monthly_savings NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id,
        g.user_id,
        g.name,
        g.target_amount,
        g.current_amount,
        g.progress_pct,
        g.remaining,
        ROUND(
            (g.remaining / 
             GREATEST(1, 
                (EXTRACT(YEAR FROM AGE(f.target_date, CURRENT_DATE)) * 12 + 
                 EXTRACT(MONTH FROM AGE(f.target_date, CURRENT_DATE))))
            )::numeric, 
            2
        ) AS required_monthly_savings
    FROM goal_progress_summary g
    JOIN financial_goals f ON f.id = g.id
    WHERE g.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Category Expense Report
CREATE OR REPLACE FUNCTION generate_expense_report(p_user_id BIGINT)
RETURNS TABLE (
    category expense_category_type,
    total NUMERIC,
    average_transaction NUMERIC,
    transactions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.category,
        SUM(e.amount) AS total,
        ROUND(AVG(e.amount)::numeric, 2) AS average_transaction,
        COUNT(*) AS transactions
    FROM expenses e
    WHERE e.user_id = p_user_id
    GROUP BY e.category
    HAVING SUM(e.amount) > 0
    ORDER BY total DESC;
END;
$$ LANGUAGE plpgsql;
