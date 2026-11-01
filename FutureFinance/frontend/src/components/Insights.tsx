import React from 'react';
import { InsightItem } from '../types.js';
import { BrainCircuit, AlertTriangle, Lightbulb, Sparkles } from 'lucide-react';

interface InsightsProps {
  insights: InsightItem[];
}

export const Insights: React.FC<InsightsProps> = ({ insights }) => {
  return (
    <div className="glass-box">
      <div className="box-title-row">
        <div>
          <h3>Explainable AI Intelligence Diagnostics</h3>
          <p>Deterministic rules inspecting your cashflow, liabilities, and safety runway</p>
        </div>
        <BrainCircuit size={22} color="#c084fc" />
      </div>

      {insights.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginTop: 16 }}>
          {insights.map((item, idx) => {
            const isHigh = item.strength === 'high';
            return (
              <div
                key={idx}
                style={{
                  padding: 22,
                  background: 'rgba(10, 16, 30, 0.75)',
                  border: `1px solid ${isHigh ? 'rgba(244, 63, 94, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
                  borderRadius: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: `0 8px 25px ${isHigh ? 'rgba(244, 63, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)'}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span className={`tag-badge ${isHigh ? 'coral' : 'amber'}`}>
                      {isHigh ? <AlertTriangle size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> : <Lightbulb size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
                      {item.strength} Priority Rule
                    </span>
                  </div>

                  <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
                    {item.recommendation}
                  </h4>
                  <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px' }}>
                    {item.reason}
                  </p>
                </div>

                <div>
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      borderLeft: '3px solid #10b981',
                      padding: '10px 14px',
                      borderRadius: '0 8px 8px 0',
                      fontSize: 12.5,
                      color: '#34d399',
                      fontWeight: 600,
                      marginBottom: 12
                    }}
                  >
                    Expected Impact: {item.impact}
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-glass)', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Trigger evidence: {JSON.stringify(item.metrics)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Sparkles size={40} color="#10b981" style={{ margin: '0 auto 12px', opacity: 0.8 }} />
          <h4 style={{ color: '#fff', margin: '0 0 6px', fontSize: 16 }}>All Diagnostics Nominal</h4>
          <p style={{ fontSize: 13, maxWidth: 400, margin: '0 auto', color: 'var(--text-secondary)' }}>
            Savings rate, emergency runway, and debt burden are currently within resilient safety parameters.
          </p>
        </div>
      )}
    </div>
  );
};
