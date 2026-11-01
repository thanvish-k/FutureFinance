import React from 'react';
import { DashboardData } from '../types.js';
import { formatINR } from '../api.js';
import {
  TrendingUp,
  Receipt,
  PiggyBank,
  Briefcase,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DashboardProps {
  data: DashboardData;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const {
    monthly_income,
    monthly_expenses,
    monthly_savings,
    portfolio_value,
    health,
    expense_categories,
    highest_category
  } = data;

  return (
    <>
      {/* 1. Vibrant Top Stat Cards */}
      <section className="stats-grid">
        <article className="stat-card-glow emerald">
          <div className="stat-top-row">
            <span className="stat-title">Monthly Income</span>
            <div className="stat-badge-icon emerald">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="stat-big-val tabular">{formatINR(monthly_income)}</div>
          <div className="stat-footer-text">
            <span style={{ color: '#34d399', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
              <ArrowUpRight size={14} /> Inflow verified
            </span>
          </div>
        </article>

        <article className="stat-card-glow coral">
          <div className="stat-top-row">
            <span className="stat-title">Monthly Outflows</span>
            <div className="stat-badge-icon coral">
              <Receipt size={18} />
            </div>
          </div>
          <div className="stat-big-val tabular" style={{ color: '#fb7185' }}>
            {formatINR(monthly_expenses)}
          </div>
          <div className="stat-footer-text">
            Primary drain: <strong style={{ color: '#fff' }}>{highest_category || 'None'}</strong>
          </div>
        </article>

        <article className="stat-card-glow cyan">
          <div className="stat-top-row">
            <span className="stat-title">Net Available Surplus</span>
            <div className="stat-badge-icon cyan">
              <PiggyBank size={18} />
            </div>
          </div>
          <div className="stat-big-val tabular" style={{ color: '#38bdf8' }}>
            {formatINR(monthly_savings)}
          </div>
          <div className="stat-footer-text">
            Savings rate: <strong style={{ color: '#38bdf8' }}>{health.metrics.savings_rate}%</strong>
          </div>
        </article>

        <article className="stat-card-glow indigo">
          <div className="stat-top-row">
            <span className="stat-title">Invested Portfolio</span>
            <div className="stat-badge-icon indigo">
              <Briefcase size={18} />
            </div>
          </div>
          <div className="stat-big-val tabular" style={{ color: '#a5b4fc' }}>
            {formatINR(portfolio_value)}
          </div>
          <div className="stat-footer-text">
            Multi-asset diversified corpus
          </div>
        </article>
      </section>

      {/* 2. Vibrant Financial Health Command Center */}
      <section className="health-command-box">
        <div className="gauge-panel">
          <span style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>
            Financial Health Diagnostic
          </span>
          <div className="score-number-wrap">
            <span className="score-display-glow tabular">{health.score}</span>
            <span className="score-denom-glow">/100</span>
          </div>
          <div className="health-badge-status">
            <CheckCircle2 size={14} />
            <span>{health.score >= 75 ? 'Optimal Health Profile' : health.score >= 50 ? 'Moderate Buffer' : 'Action Advised'}</span>
          </div>
        </div>

        <div className="health-tracks-grid">
          <div className="track-item">
            <div className="track-meta">
              <span>Savings Rate Benchmark</span>
              <b>{health.breakdown['Savings rate']} / 25 pts</b>
            </div>
            <div className="track-rail">
              <div
                className="track-fill-glow emerald"
                style={{ width: `${(health.breakdown['Savings rate'] / 25) * 100}%` }}
              />
            </div>
          </div>

          <div className="track-item">
            <div className="track-meta">
              <span>Debt Management</span>
              <b>{health.breakdown['Debt management']} / 25 pts</b>
            </div>
            <div className="track-rail">
              <div
                className="track-fill-glow cyan"
                style={{ width: `${(health.breakdown['Debt management'] / 25) * 100}%` }}
              />
            </div>
          </div>

          <div className="track-item">
            <div className="track-meta">
              <span>Emergency Reserve Runway</span>
              <b>{health.breakdown['Emergency fund']} / 20 pts</b>
            </div>
            <div className="track-rail">
              <div
                className="track-fill-glow amber"
                style={{ width: `${(health.breakdown['Emergency fund'] / 20) * 100}%` }}
              />
            </div>
          </div>

          <div className="track-item">
            <div className="track-meta">
              <span>Asset Diversification</span>
              <b>{health.breakdown['Investment diversification']} / 15 pts</b>
            </div>
            <div className="track-rail">
              <div
                className="track-fill-glow indigo"
                style={{ width: `${(health.breakdown['Investment diversification'] / 15) * 100}%` }}
              />
            </div>
          </div>

          <div className="track-item" style={{ gridColumn: 'span 2' }}>
            <div className="track-meta">
              <span>Financial Goal Trajectory</span>
              <b>{health.breakdown['Goal progress']} / 15 pts</b>
            </div>
            <div className="track-rail">
              <div
                className="track-fill-glow violet"
                style={{ width: `${(health.breakdown['Goal progress'] / 15) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Deep Analytical Chart & Diagnostics */}
      <section className="dashboard-duo">
        <article className="glass-box">
          <div className="box-title-row">
            <div>
              <h3>Monthly Expenditures by Category</h3>
              <p>Aggregated directly from local database expense transactions</p>
            </div>
            <Sparkles size={18} color="#38bdf8" />
          </div>

          <div className="chart-stage">
            {expense_categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expense_categories} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} tickLine={false} />
                  <Tooltip
                    formatter={(val: number) => [formatINR(val), 'Spent']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.5)'
                    }}
                  />
                  <Bar dataKey="value" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No expense entries found in local database.
              </div>
            )}
          </div>
        </article>

        <article className="glass-box">
          <div className="box-title-row">
            <div>
              <h3>Relational Audit Snapshot</h3>
              <p>Key risk ratios & integrity status</p>
            </div>
            <ShieldCheck size={18} color="#10b981" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'rgba(10, 16, 30, 0.7)', padding: 14, borderRadius: 10, border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Debt-to-Income (DTI)
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: health.metrics.debt_to_income > 40 ? '#f43f5e' : '#38bdf8', marginTop: 4 }}>
                {health.metrics.debt_to_income}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {health.metrics.debt_to_income > 40 ? 'High credit liability burden' : 'Well within safe 40% margin'}
              </div>
            </div>

            <div style={{ background: 'rgba(10, 16, 30, 0.7)', padding: 14, borderRadius: 10, border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Liquid Emergency Runway
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#34d399', marginTop: 4 }}>
                {monthly_expenses > 0 ? (data.savings_balance / monthly_expenses).toFixed(1) : '∞'} Months
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Backed by {formatINR(data.savings_balance)} in liquid savings
              </div>
            </div>

            <div style={{ background: 'rgba(10, 16, 30, 0.7)', padding: 14, borderRadius: 10, border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Relational Model Status
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#34d399', marginTop: 4 }}>
                3NF Normalization Active
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                PL/pgSQL triggers logging audit events atomically
              </div>
            </div>
          </div>
        </article>
      </section>
    </>
  );
};
