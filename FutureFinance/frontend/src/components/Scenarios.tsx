import React, { useState } from 'react';
import { apiCall, formatINR } from '../api.js';
import { ScenarioItem, DashboardData } from '../types.js';
import { Sliders, Plus, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ScenariosProps {
  scenarios: ScenarioItem[];
  dashboard: DashboardData | null;
  onRefresh: () => void;
}

export const Scenarios: React.FC<ScenariosProps> = ({ scenarios, dashboard, onRefresh }) => {
  const [form, setForm] = useState({
    name: 'Discretionary 15% Reduction',
    income_change_pct: 0,
    expense_change_pct: -15,
    contribution_change: 5000
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sandbox, setSandbox] = useState({
    incomePct: 0,
    expensePct: -10
  });

  const baseIncome = dashboard?.monthly_income || 100000;
  const baseExpenses = dashboard?.monthly_expenses || 45000;

  const simIncome = baseIncome * (1 + sandbox.incomePct / 100);
  const simExpenses = baseExpenses * (1 + sandbox.expensePct / 100);
  const simSurplus = Math.max(0, simIncome - simExpenses);
  const baseSurplus = Math.max(0, baseIncome - baseExpenses);
  const deltaSurplus = simSurplus - baseSurplus;

  const handleSaveScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiCall('/scenarios', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      onRefresh();
      setForm({ name: '', income_change_pct: 0, expense_change_pct: 0, contribution_change: 0 });
    } catch (err: any) {
      setError(err.message || 'Failed to save scenario');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
      {/* Interactive What-If Sandbox */}
      <div className="glass-box">
        <div className="box-title-row">
          <div>
            <h3>What-If Hypothesis Sandbox</h3>
            <p>Simulate budget variations and observe real-time surplus impact</p>
          </div>
          <Sliders size={20} color="#38bdf8" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="form-label" style={{ margin: 0 }}>Income Delta</span>
              <span className="tag-badge cyan tabular" style={{ fontSize: 13 }}>
                {sandbox.incomePct > 0 ? `+${sandbox.incomePct}%` : `${sandbox.incomePct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              step="5"
              value={sandbox.incomePct}
              onChange={(e) => setSandbox({ ...sandbox, incomePct: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="form-label" style={{ margin: 0 }}>Expense Reduction / Increase</span>
              <span className="tag-badge amber tabular" style={{ fontSize: 13 }}>
                {sandbox.expensePct > 0 ? `+${sandbox.expensePct}%` : `${sandbox.expensePct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              step="5"
              value={sandbox.expensePct}
              onChange={(e) => setSandbox({ ...sandbox, expensePct: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#fbbf24' }}
            />
          </div>

          {/* Dynamic Impact Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 10 }}>
            <div style={{ background: 'rgba(10, 16, 30, 0.8)', padding: 18, borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Simulated Monthly Cashflow
              </div>
              <div className="tabular" style={{ fontSize: 24, fontWeight: 800, color: '#34d399', marginTop: 4 }}>
                {formatINR(simSurplus)}
              </div>
              <div style={{ fontSize: 12, color: deltaSurplus >= 0 ? '#34d399' : '#fb7185', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                {deltaSurplus >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {formatINR(deltaSurplus)} / month shift
              </div>
            </div>

            <div style={{ background: 'rgba(10, 16, 30, 0.8)', padding: 18, borderRadius: 12, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                12-Month Compounding Delta
              </div>
              <div className="tabular" style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
                {formatINR(deltaSurplus * 12)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Annual net wealth expansion
              </div>
            </div>
          </div>
        </div>

        {/* Save Scenario Form */}
        <div style={{ marginTop: 26, paddingTop: 20, borderTop: '1px solid var(--border-glass)' }}>
          <h4 style={{ fontSize: 14, color: '#fff', margin: '0 0 12px', fontWeight: 700 }}>
            Save Assumption to Database
          </h4>
          {error && <div style={{ background: 'rgba(244,63,94,0.15)', color: '#fb7185', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>{error}</div>}
          <form onSubmit={handleSaveScenario} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              className="form-ctrl"
              type="text"
              required
              placeholder="e.g. Discretionary Cut 15%"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input
                className="form-ctrl"
                type="number"
                placeholder="Income delta %"
                value={form.income_change_pct}
                onChange={(e) => setForm({ ...form, income_change_pct: Number(e.target.value) })}
              />
              <input
                className="form-ctrl"
                type="number"
                placeholder="Expense delta %"
                value={form.expense_change_pct}
                onChange={(e) => setForm({ ...form, expense_change_pct: Number(e.target.value) })}
              />
            </div>
            <button type="submit" className="btn-gradient" style={{ justifyContent: 'center' }} disabled={saving}>
              <Plus size={16} />
              {saving ? 'Recording Scenario...' : 'Save Scenario to PostgreSQL'}
            </button>
          </form>
        </div>
      </div>

      {/* Persistent Saved Database Scenarios */}
      <div className="glass-box">
        <div className="box-title-row">
          <div>
            <h3>Persistent Scenarios</h3>
            <p>Saved what-if models in local PostgreSQL</p>
          </div>
          <Zap size={20} color="#fbbf24" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {scenarios.length > 0 ? (
            scenarios.map((sc) => (
              <div
                key={sc.id}
                style={{
                  padding: '16px',
                  background: 'rgba(10, 16, 30, 0.7)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 12
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: 15, color: '#fff', fontWeight: 700 }}>{sc.name}</h4>
                  <span className="tag-badge cyan tabular">#{sc.id}</span>
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 13, marginTop: 10 }}>
                  <span className="tag-badge emerald tabular">
                    Income: {sc.income_change_pct > 0 ? `+${sc.income_change_pct}%` : `${sc.income_change_pct}%`}
                  </span>
                  <span className="tag-badge amber tabular">
                    Expenses: {sc.expense_change_pct > 0 ? `+${sc.expense_change_pct}%` : `${sc.expense_change_pct}%`}
                  </span>
                  {Number(sc.contribution_change) > 0 && (
                    <span className="tag-badge cyan tabular">
                      +{formatINR(Number(sc.contribution_change))}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No saved scenarios recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
