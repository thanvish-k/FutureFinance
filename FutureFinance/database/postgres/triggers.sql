-- =====================================================================
-- FutureFinance PostgreSQL Triggers (Audit Trail & Business Rules)
-- =====================================================================

-- 1. Audit Log Trigger Function for Expenses
CREATE OR REPLACE FUNCTION fn_audit_expense_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, details)
    VALUES (
        NEW.user_id,
        'INSERT',
        'expenses',
        NEW.id,
        json_build_object('amount', NEW.amount, 'category', NEW.category, 'spent_on', NEW.spent_on)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_expense_insert ON expenses;
CREATE TRIGGER audit_expense_insert
AFTER INSERT ON expenses
FOR EACH ROW
EXECUTE FUNCTION fn_audit_expense_insert();

-- 2. Audit Log Trigger Function for Investment Updates
CREATE OR REPLACE FUNCTION fn_audit_investment_update()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, details)
    VALUES (
        NEW.user_id,
        'UPDATE',
        'investments',
        NEW.id,
        json_build_object(
            'old_value', OLD.current_value,
            'new_value', NEW.current_value,
            'name', NEW.name
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_investment_update ON investments;
CREATE TRIGGER audit_investment_update
AFTER UPDATE ON investments
FOR EACH ROW
EXECUTE FUNCTION fn_audit_investment_update();

-- 3. Goal Validation Trigger: Target date must be strictly in the future
CREATE OR REPLACE FUNCTION fn_validate_goal_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.target_date <= CURRENT_DATE THEN
        RAISE EXCEPTION 'Goal target date must be in the future (after %)', CURRENT_DATE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_goal_date ON financial_goals;
CREATE TRIGGER validate_goal_date
BEFORE INSERT OR UPDATE ON financial_goals
FOR EACH ROW
EXECUTE FUNCTION fn_validate_goal_date();
