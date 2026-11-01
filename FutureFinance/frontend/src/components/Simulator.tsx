import React, { useState } from 'react';
import { apiCall, formatINR } from '../api.js';
import { SimulationResult } from '../types.js';
import { FlaskConical, Target, AlertCircle, Play, Sparkles } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const Simulator: React.FC = () => {
  const [params, setParams] = useState({
    initial_amount: 100000,
    monthly_contribution: 10000,
    annual_return: 11.5,
    volatility: 15.0,
    years: 10,
    simulations: 5000,
    goal_target: 3000000
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiCall<SimulationResult>('/simulation/run', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Simulation execution failed');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result
    ? result.distribution.map((count, i) => ({
        range: `₹${(result.bins[i] / 100000).toFixed(1)}L`,
        count
      }))
    : [];

  return (
    <div className="sim-grid">
      {/* Parameter Control Panel */}
      <div className="glass-box">
        <div className="box-title-row">
          <div>
            <h3>Monte Carlo Parameters</h3>
            <p>Stochastic market path generator</p>
          </div>
          <FlaskConical size={20} color="#38bdf8" />
        </div>

        {error && <div style={{ background: 'rgba(244,63,94,0.15)', color: '#fb7185', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleRun} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Initial Corpus (₹)</label>
            <input
              className="form-ctrl"
              type="number"
              min="0"
              value={params.initial_amount}
              onChange={(e) => setParams({ ...params, initial_amount: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="form-label">Monthly Contribution (₹ SIP)</label>
            <input
              className="form-ctrl"
              type="number"
              min="0"
              value={params.monthly_contribution}
              onChange={(e) => setParams({ ...params, monthly_contribution: Number(e.target.value) })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Expected Return (%)</label>
              <input
                className="form-ctrl"
                type="number"
                step="0.1"
                value={params.annual_return}
                onChange={(e) => setParams({ ...params, annual_return: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="form-label">Volatility / Risk (%)</label>
              <input
                className="form-ctrl"
                type="number"
                step="0.1"
                value={params.volatility}
                onChange={(e) => setParams({ ...params, volatility: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Time Horizon (Years)</label>
              <input
                className="form-ctrl"
                type="number"
                min="1"
                max="40"
                value={params.years}
                onChange={(e) => setParams({ ...params, years: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="form-label">Paths / Iterations</label>
              <input
                className="form-ctrl"
                type="number"
                min="500"
                max="20000"
                step="500"
                value={params.simulations}
                onChange={(e) => setParams({ ...params, simulations: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Target Milestone Goal (₹)</label>
            <input
              className="form-ctrl"
              type="number"
              min="0"
              value={params.goal_target}
              onChange={(e) => setParams({ ...params, goal_target: Number(e.target.value) })}
            />
          </div>

          <button type="submit" className="btn-gradient" style={{ justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Synthesizing 5,000 Paths...' : 'Execute 5,000 Simulations'}
            <Play size={15} fill="currentColor" />
          </button>
        </form>
      </div>

      {/* Visualizer & Percentile Output */}
      <div className="glass-box" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="box-title-row">
          <div>
            <h3>Simulated Terminal Wealth Distribution</h3>
            <p>
              {result ? `Statistical spread across ${params.simulations.toLocaleString()} empirical paths` : 'Execute the model to calculate percentile ranges'}
            </p>
          </div>
          {result && (
            <span className="tag-badge cyan">
              <Sparkles size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Run #{result.run_id} Logged
            </span>
          )}
        </div>

        {result ? (
          <div>
            {/* Colorful 5-Percentile Deck */}
            <div className="percentile-glow-deck">
              <div className="p-card" style={{ borderColor: 'rgba(244,63,94,0.3)' }}>
                <div className="p-label" style={{ color: '#fb7185' }}>P10 (Bear)</div>
                <div className="p-val-glow tabular" style={{ color: '#fb7185' }}>{formatINR(result.percentiles.p10)}</div>
              </div>

              <div className="p-card" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
                <div className="p-label" style={{ color: '#fbbf24' }}>P25 (Conservative)</div>
                <div className="p-val-glow tabular" style={{ color: '#fbbf24' }}>{formatINR(result.percentiles.p25)}</div>
              </div>

              <div className="p-card median-highlight">
                <div className="p-label" style={{ color: '#34d399' }}>Median (P50)</div>
                <div className="p-val-glow tabular" style={{ color: '#38bdf8', fontSize: 19 }}>
                  {formatINR(result.percentiles.median)}
                </div>
              </div>

              <div className="p-card" style={{ borderColor: 'rgba(56,189,248,0.3)' }}>
                <div className="p-label" style={{ color: '#38bdf8' }}>P75 (Growth)</div>
                <div className="p-val-glow tabular" style={{ color: '#38bdf8' }}>{formatINR(result.percentiles.p75)}</div>
              </div>

              <div className="p-card" style={{ borderColor: 'rgba(192,132,252,0.3)' }}>
                <div className="p-label" style={{ color: '#c084fc' }}>P90 (Bull)</div>
                <div className="p-val-glow tabular" style={{ color: '#c084fc' }}>{formatINR(result.percentiles.p90)}</div>
              </div>
            </div>

            {/* Target Likelihood Banner */}
            {result.goal_probability !== null && (
              <div className="goal-prob-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Target size={24} color="#34d399" />
                  <div>
                    <div className="prob-title">Target Goal Achievement Probability</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Target of {formatINR(params.goal_target)} in {params.years} years
                    </div>
                  </div>
                </div>
                <div className="prob-pct-number tabular">{result.goal_probability}%</div>
              </div>
            )}

            {/* Vibrant Frequency Histogram */}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                Frequency Distribution of Final Outcomes
              </div>
              <div style={{ height: 210 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="range" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip
                      formatter={(val: number) => [`${val} paths`, 'Trials']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(129, 140, 248, 0.4)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="count" fill="url(#histGradient)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ marginTop: 18, padding: 12, background: 'rgba(10,16,30,0.6)', borderRadius: 8, border: '1px solid var(--border-glass)', display: 'flex', gap: 10 }}>
              <AlertCircle size={16} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
              <small style={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 1.5 }}>
                {result.disclaimer}
              </small>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', placeItems: 'center', flex: 1, minHeight: 320, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
            <div>
              <FlaskConical size={42} color="#38bdf8" style={{ margin: '0 auto 12px', opacity: 0.7 }} />
              <h4 style={{ color: '#fff', margin: '0 0 6px 0', fontSize: 16 }}>Engine Ready</h4>
              <p style={{ fontSize: 13, maxWidth: 360, margin: 0, color: 'var(--text-secondary)' }}>
                Tune expected return, volatility, and contribution parameters, then click execute to view the stochastic distribution.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
