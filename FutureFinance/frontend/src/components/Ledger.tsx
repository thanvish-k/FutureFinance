import React, { useState } from 'react';
import { apiCall, formatINR } from '../api.js';
import { Plus, Trash2, X } from 'lucide-react';

interface LedgerProps {
  title: string;
  rows: any[];
  onRefresh: () => void;
}

export const Ledger: React.FC<LedgerProps> = ({ title, rows, onRefresh }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const resource = title.toLowerCase() === 'goals' ? 'goals' : title.toLowerCase();
  const today = new Date().toISOString().slice(0, 10);

  const getFieldConfig = () => {
    switch (title) {
      case 'Income':
        return {
          fields: ['source', 'amount', 'received_on', 'description'],
          choices: { source: ['Salary', 'Freelance', 'Business', 'Interest', 'Other'] },
          defaults: { source: 'Salary', amount: 50000, received_on: today, description: '' }
        };
      case 'Expenses':
        return {
          fields: ['category', 'amount', 'spent_on', 'description'],
          choices: {
            category: ['Food', 'Transportation', 'Education', 'Entertainment', 'Shopping', 'Healthcare', 'Rent', 'Utilities', 'Other']
          },
          defaults: { category: 'Food', amount: 3500, spent_on: today, description: '' }
        };
      case 'Investments':
        return {
          fields: ['name', 'investment_type', 'amount_invested', 'current_value', 'purchase_date', 'expected_return', 'risk_level'],
          choices: {
            investment_type: ['Stocks', 'Mutual Funds', 'Fixed Deposits', 'Bonds', 'Gold', 'ETFs'],
            risk_level: ['low', 'medium', 'high']
          },
          defaults: {
            name: '',
            investment_type: 'Mutual Funds',
            amount_invested: 50000,
            current_value: 55000,
            purchase_date: today,
            expected_return: 11.0,
            risk_level: 'medium'
          }
        };
      case 'Goals':
      default:
        return {
          fields: ['name', 'target_amount', 'current_amount', 'target_date', 'priority'],
          choices: { priority: ['low', 'medium', 'high'] },
          defaults: {
            name: '',
            target_amount: 500000,
            current_amount: 100000,
            target_date: '2028-01-01',
            priority: 'medium'
          }
        };
    }
  };

  const config = getFieldConfig();

  const handleOpenAdd = () => {
    setForm({ ...config.defaults });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, any> = {};
      for (const [key, val] of Object.entries(form)) {
        if (['amount', 'amount_invested', 'current_value', 'expected_return', 'target_amount', 'current_amount'].includes(key)) {
          payload[key] = Number(val);
        } else {
          payload[key] = val;
        }
      }

      await apiCall(`/${resource}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to persist record to database');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this record from local database?')) return;
    try {
      await apiCall(`/${resource}/${id}`, { method: 'DELETE' });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Deletion failed');
    }
  };

  const getTagColor = (val: string) => {
    if (['Salary', 'low', 'Gold', 'Mutual Funds'].includes(val)) return 'emerald';
    if (['Freelance', 'ETFs', 'Rent'].includes(val)) return 'cyan';
    if (['medium', 'Food', 'Fixed Deposits'].includes(val)) return 'amber';
    return 'coral';
  };

  return (
    <div className="glass-box">
      <div className="box-title-row">
        <div>
          <h3>{title} Master Ledger</h3>
          <p>
            {rows.length} verified relational rows &bull; Protected with ownership checks
          </p>
        </div>
        <button className="btn-gradient" onClick={handleOpenAdd}>
          <Plus size={16} />
          Add {title.slice(0, -1)}
        </button>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
        <table className="vibrant-table">
          <thead>
            <tr>
              <th style={{ width: 50 }}>ID</th>
              {config.fields.map((f) => (
                <th key={f}>{f.replace('_', ' ')}</th>
              ))}
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="tabular" style={{ color: 'var(--text-muted)' }}>
                    #{row.id}
                  </td>
                  {config.fields.map((f) => {
                    const val = row[f];
                    const isCurrency = ['amount', 'amount_invested', 'current_value', 'target_amount', 'current_amount'].includes(f);
                    const isChoice = config.choices && (config.choices as any)[f];
                    return (
                      <td key={f} className={isCurrency ? 'tabular' : ''}>
                        {isCurrency ? (
                          <span style={{ fontWeight: 700, color: '#fff' }}>{formatINR(val)}</span>
                        ) : isChoice ? (
                          <span className={`tag-badge ${getTagColor(String(val))}`}>
                            {val}
                          </span>
                        ) : f.includes('date') || f.includes('on') ? (
                          <span className="tabular" style={{ color: '#94a3b8' }}>
                            {String(val || '').slice(0, 10)}
                          </span>
                        ) : (
                          String(val ?? '—')
                        )}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(row.id)}
                    >
                      <Trash2 size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={config.fields.length + 2} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  No records stored yet in {title}. Click 'Add {title.slice(0, -1)}' to record your first entry.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Screen */}
      {modalOpen && (
        <div className="modal-screen">
          <div className="modal-box-glow">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border-glass)' }}>
              <h3 style={{ margin: 0, fontSize: 18, color: '#fff', fontWeight: 800 }}>New {title.slice(0, -1)} Record</h3>
              <button
                style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {error && <div style={{ background: 'rgba(244,63,94,0.15)', color: '#fb7185', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>{error}</div>}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {config.fields.map((field) => (
                <div key={field}>
                  <label className="form-label">{field.replace('_', ' ')}</label>
                  {(config.choices as any)[field] ? (
                    <select
                      className="form-ctrl"
                      value={form[field] || (config.choices as any)[field][0]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    >
                      {(config.choices as any)[field].map((opt: string) => (
                        <option key={opt} value={opt} style={{ background: '#0f172a' }}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="form-ctrl"
                      type={
                        ['amount', 'amount_invested', 'current_value', 'expected_return', 'target_amount', 'current_amount'].includes(field)
                          ? 'number'
                          : field.includes('date') || field.includes('on')
                          ? 'date'
                          : 'text'
                      }
                      required={field !== 'description'}
                      value={form[field] ?? ''}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    />
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                <button
                  type="button"
                  style={{ background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gradient" disabled={saving}>
                  {saving ? 'Writing to Postgres...' : 'Commit Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
