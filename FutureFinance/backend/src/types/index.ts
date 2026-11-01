export type UserRole = 'user' | 'admin';
export type RiskTolerance = 'low' | 'moderate' | 'high';
export type IncomeSource = 'Salary' | 'Freelance' | 'Business' | 'Interest' | 'Other';
export type ExpenseCategory = 'Food' | 'Transportation' | 'Education' | 'Entertainment' | 'Shopping' | 'Healthcare' | 'Rent' | 'Utilities' | 'Other';
export type InvestmentType = 'Stocks' | 'Mutual Funds' | 'Fixed Deposits' | 'Bonds' | 'Gold' | 'ETFs';
export type RiskLevel = 'low' | 'medium' | 'high';
export type Priority = 'low' | 'medium' | 'high';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: string | Date;
}

export interface FinancialProfile {
  id: number;
  user_id: number;
  age: number | null;
  monthly_income: number;
  savings: number;
  risk_tolerance: RiskTolerance;
  updated_at: string | Date;
}

export interface Income {
  id: number;
  user_id: number;
  source: IncomeSource;
  amount: number;
  received_on: string;
  description?: string | null;
}

export interface Expense {
  id: number;
  user_id: number;
  category: ExpenseCategory;
  amount: number;
  spent_on: string;
  description?: string | null;
}

export interface Investment {
  id: number;
  user_id: number;
  name: string;
  investment_type: InvestmentType;
  amount_invested: number;
  current_value: number;
  purchase_date: string;
  expected_return: number;
  risk_level: RiskLevel;
}

export interface Goal {
  id: number;
  user_id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  priority: Priority;
}

export interface Loan {
  id: number;
  user_id: number;
  lender: string;
  outstanding_amount: number;
  monthly_emi: number;
}

export interface Scenario {
  id: number;
  user_id: number;
  name: string;
  income_change_pct: number;
  expense_change_pct: number;
  contribution_change: number;
  created_at: string | Date;
}

export interface SimulationRun {
  id: number;
  user_id: number;
  initial_amount: number;
  monthly_contribution: number;
  annual_return: number;
  volatility: number;
  years: number;
  simulations: number;
  goal_target?: number | null;
  created_at: string | Date;
}

export interface SimulationPercentiles {
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
}

export interface SimulationResult {
  run_id?: number;
  percentiles: SimulationPercentiles;
  goal_probability: number | null;
  sample_paths: number[][];
  distribution: number[];
  bins: number[];
  disclaimer: string;
}

export interface HealthBreakdown {
  'Savings rate': number;
  'Debt management': number;
  'Emergency fund': number;
  'Investment diversification': number;
  'Goal progress': number;
}

export interface HealthMetrics {
  savings_rate: number;
  debt_to_income: number;
}

export interface HealthScore {
  score: number;
  breakdown: HealthBreakdown;
  metrics: HealthMetrics;
}

export interface Insight {
  recommendation: string;
  reason: string;
  metrics: Record<string, any>;
  impact: string;
  strength: 'low' | 'medium' | 'high';
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

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}
