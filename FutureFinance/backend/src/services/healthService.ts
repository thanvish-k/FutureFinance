import { HealthScore, Insight, Goal, Loan } from '../types/index.js';

export function calculateHealthScore(
  income: number,
  expenses: number,
  savings: number,
  investments: number,
  loans: Loan[],
  goals: Goal[]
): HealthScore {
  const savingsRate = income > 0 ? (income - expenses) / income : 0;
  const totalDebt = loans.reduce((acc, curr) => acc + (Number(curr.outstanding_amount) || 0), 0);
  const annualIncome = income * 12;
  const dti = annualIncome > 0 ? totalDebt / annualIncome : (totalDebt > 0 ? 1 : 0);

  // 1. Savings rate (Max 25 pts, 20% savings rate achieves 25 pts)
  const savingsRateScore = Math.max(0, Math.min(25, savingsRate * 125));

  // 2. Debt management (Max 25 pts)
  const debtScore = Math.max(0, Math.min(25, 25 * (1 - Math.min(1, dti))));

  // 3. Emergency fund (Max 20 pts, 6 months expenses achieves 20 pts)
  const emergencyMonths = expenses > 0 ? savings / expenses : 6;
  const emergencyScore = Math.min(20, Math.max(0, (emergencyMonths / 6) * 20));

  // 4. Diversification (Max 15 pts, ₹100,000 baseline threshold)
  const diversificationScore = Math.min(15, Math.max(0, (investments / 100000) * 15));

  // 5. Goal progress (Max 15 pts)
  let goalProgressRatio = 0.5;
  if (goals.length > 0) {
    const sumProgress = goals.reduce((acc, g) => {
      const target = Number(g.target_amount) || 1;
      const current = Number(g.current_amount) || 0;
      return acc + Math.min(1, current / target);
    }, 0);
    goalProgressRatio = sumProgress / goals.length;
  }
  const goalScore = Math.min(15, Math.max(0, goalProgressRatio * 15));

  const breakdown = {
    'Savings rate': Math.round(savingsRateScore * 10) / 10,
    'Debt management': Math.round(debtScore * 10) / 10,
    'Emergency fund': Math.round(emergencyScore * 10) / 10,
    'Investment diversification': Math.round(diversificationScore * 10) / 10,
    'Goal progress': Math.round(goalScore * 10) / 10
  };

  const totalScore = Math.round(
    (breakdown['Savings rate'] +
      breakdown['Debt management'] +
      breakdown['Emergency fund'] +
      breakdown['Investment diversification'] +
      breakdown['Goal progress']) * 10
  ) / 10;

  return {
    score: totalScore,
    breakdown,
    metrics: {
      savings_rate: Math.round(savingsRate * 1000) / 10,
      debt_to_income: Math.round(dti * 1000) / 10
    }
  };
}

export function generateInsights(
  income: number,
  expenses: number,
  savings: number,
  health: HealthScore,
  highestCategory: string | null,
  loans: Loan[],
  goals: Goal[]
): Insight[] {
  const insights: Insight[] = [];
  const rate = health.metrics.savings_rate;
  const dti = health.metrics.debt_to_income;

  if (rate < 20) {
    insights.push({
      recommendation: 'Increase monthly savings rate',
      reason: `Current savings rate is ${rate}%, which falls beneath the 20% resilience benchmark.`,
      metrics: { monthly_income: income, monthly_expenses: expenses, savings_rate: `${rate}%` },
      impact: 'Establishes stronger capital buffer and improves financial health score by up to 10 points.',
      strength: 'high'
    });
  }

  const runwayMonths = expenses > 0 ? savings / expenses : 12;
  if (expenses > 0 && runwayMonths < 3) {
    insights.push({
      recommendation: 'Build emergency reserve buffer',
      reason: `Liquid savings cover only ${runwayMonths.toFixed(1)} months of living costs (target: 3-6 months).`,
      metrics: { liquid_savings: savings, monthly_burn: expenses, runway_months: runwayMonths.toFixed(1) },
      impact: 'Mitigates forced liquidation of investments during unplanned life events.',
      strength: 'high'
    });
  }

  if (highestCategory) {
    insights.push({
      recommendation: `Audit ${highestCategory} expenditures`,
      reason: `${highestCategory} represents your single highest operational expense category.`,
      metrics: { primary_category: highestCategory },
      impact: 'Trimming 10% from this segment can unlock direct surplus for high-priority investments.',
      strength: 'medium'
    });
  }

  if (dti > 40) {
    insights.push({
      recommendation: 'Accelerate debt payoff strategy',
      reason: `Debt-to-income ratio is ${dti}%, indicating elevated fixed credit liabilities.`,
      metrics: { debt_to_income: `${dti}%`, total_debt: loans.reduce((a, b) => a + Number(b.outstanding_amount || 0), 0) },
      impact: 'Reduces interest overhead and significantly improves overall credit profile.',
      strength: 'high'
    });
  }

  const behindGoals = goals.filter((g) => {
    const ratio = (Number(g.current_amount) || 0) / (Number(g.target_amount) || 1);
    return ratio < 0.25;
  });

  if (behindGoals.length > 0) {
    insights.push({
      recommendation: `Realign contribution to '${behindGoals[0].name}'`,
      reason: `Goal is at ${(Number(behindGoals[0].current_amount) / Number(behindGoals[0].target_amount) * 100).toFixed(0)}% completion.`,
      metrics: { goal: behindGoals[0].name, target: behindGoals[0].target_amount, current: behindGoals[0].current_amount },
      impact: 'Prevents target shortfall before maturity deadline.',
      strength: 'medium'
    });
  }

  return insights;
}
