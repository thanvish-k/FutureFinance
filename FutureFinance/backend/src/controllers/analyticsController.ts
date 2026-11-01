import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { DataService } from '../services/dataService.js';
import { calculateHealthScore, generateInsights } from '../services/healthService.js';

export const AnalyticsController = {
  async getDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const metrics = await DataService.getDashboardMetrics(userId);
      const monthlySavings = Math.max(0, metrics.monthlyIncome - metrics.monthlyExpenses);

      const health = calculateHealthScore(
        metrics.monthlyIncome,
        metrics.monthlyExpenses,
        metrics.savingsBalance,
        metrics.portfolioValue,
        metrics.loans,
        metrics.goals
      );

      res.json({
        monthly_income: metrics.monthlyIncome,
        monthly_expenses: metrics.monthlyExpenses,
        monthly_savings: monthlySavings,
        portfolio_value: metrics.portfolioValue,
        savings_balance: metrics.savingsBalance,
        expense_categories: metrics.expenseCategories,
        health,
        highest_category: metrics.highestCategory
      });
    } catch (err: any) {
      console.error('[Dashboard Error]:', err);
      res.status(500).json({ detail: 'Failed to compute dashboard metrics' });
    }
  },

  async getFinancialHealth(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const metrics = await DataService.getDashboardMetrics(userId);
      const health = calculateHealthScore(
        metrics.monthlyIncome,
        metrics.monthlyExpenses,
        metrics.savingsBalance,
        metrics.portfolioValue,
        metrics.loans,
        metrics.goals
      );
      res.json(health);
    } catch (err: any) {
      res.status(500).json({ detail: 'Failed to evaluate financial health' });
    }
  },

  async getInsights(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const metrics = await DataService.getDashboardMetrics(userId);
      const health = calculateHealthScore(
        metrics.monthlyIncome,
        metrics.monthlyExpenses,
        metrics.savingsBalance,
        metrics.portfolioValue,
        metrics.loans,
        metrics.goals
      );

      const insights = generateInsights(
        metrics.monthlyIncome,
        metrics.monthlyExpenses,
        metrics.savingsBalance,
        health,
        metrics.highestCategory,
        metrics.loans,
        metrics.goals
      );

      res.json(insights);
    } catch (err: any) {
      res.status(500).json({ detail: 'Failed to generate recommendations' });
    }
  }
};
