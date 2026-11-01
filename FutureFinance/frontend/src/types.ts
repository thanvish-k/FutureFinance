export type NavSection = 'Dashboard' | 'Income' | 'Expenses' | 'Investments' | 'Goals' | 'Simulator' | 'Scenarios' | 'Insights';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface HealthBreakdown {
  'Savings rate': number;
  'Debt management': number;
  'Emergency fund': number;
  'Investment diversification': number;
  'Goal progress': number;
}

export interface HealthScore {
  score: number;
  breakdown: HealthBreakdown;
  metrics: {
    savings_rate: number;
    debt_to_income: number;
  };
}

export interface DashboardData {
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  portfolio_value: number;
  savings_balance: number;
  expense_categories: { name: string; value: number }[];
  health: HealthScore;
  highest_category: string | null;
}

export interface InsightItem {
  recommendation: string;
  reason: string;
  metrics: Record<string, any>;
  impact: string;
  strength: 'low' | 'medium' | 'high';
}

export interface SimulationResult {
  run_id: number;
  percentiles: {
    p10: number;
    p25: number;
    median: number;
    p75: number;
    p90: number;
  };
  goal_probability: number | null;
  sample_paths: number[][];
  distribution: number[];
  bins: number[];
  disclaimer: string;
}

export interface ScenarioItem {
  id: number;
  user_id: number;
  name: string;
  income_change_pct: number;
  expense_change_pct: number;
  contribution_change: number;
  created_at: string;
}

export interface CrudRecord {
  id: number;
  user_id: number;
  [key: string]: any;
}
