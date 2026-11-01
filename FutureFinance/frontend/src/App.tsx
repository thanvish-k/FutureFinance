import React, { useState, useEffect } from 'react';
import { NavSection, User, DashboardData, InsightItem, ScenarioItem } from './types.js';
import { apiCall } from './api.js';
import { Auth } from './components/Auth.js';
import { Dashboard } from './components/Dashboard.js';
import { Simulator } from './components/Simulator.js';
import { Ledger } from './components/Ledger.js';
import { Insights } from './components/Insights.js';
import { Scenarios } from './components/Scenarios.js';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  PiggyBank,
  Target,
  FlaskConical,
  BrainCircuit,
  Sliders,
  LogOut,
  RefreshCw,
  Sparkles,
  type LucideIcon
} from 'lucide-react';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('futurefinance_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<NavSection>('Dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);
  const [crudRows, setCrudRows] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<string>('Local PostgreSQL');

  useEffect(() => {
    fetch('/health')
      .then((res) => res.json())
      .then((data) => {
        setDbStatus(data.database?.includes('PostgreSQL') ? 'Local PostgreSQL' : 'Local Standalone');
      })
      .catch(() => {
        setDbStatus('Offline');
      });
  }, []);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'Dashboard') {
        const data = await apiCall<DashboardData>('/dashboard');
        setDashboardData(data);
      } else if (activeTab === 'Insights') {
        const data = await apiCall<InsightItem[]>('/insights');
        setInsights(data);
      } else if (activeTab === 'Scenarios') {
        const [scRes, dbRes] = await Promise.all([
          apiCall<ScenarioItem[]>('/scenarios'),
          apiCall<DashboardData>('/dashboard')
        ]);
        setScenarios(scRes);
        setDashboardData(dbRes);
      } else if (['Income', 'Expenses', 'Investments', 'Goals'].includes(activeTab)) {
        const resource = activeTab === 'Goals' ? 'goals' : activeTab.toLowerCase();
        const data = await apiCall<any[]>(`/${resource}`);
        setCrudRows(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sync with local database');
      if (err.message.includes('401') || err.message.includes('token') || err.message.includes('Unauthorized')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, user]);

  const handleLogout = () => {
    localStorage.removeItem('futurefinance_token');
    localStorage.removeItem('futurefinance_user');
    setUser(null);
  };

  if (!user) {
    return <Auth onSuccess={(u) => setUser(u)} />;
  }

  const navItems: { id: NavSection; label: string; icon: LucideIcon }[] = [
    { id: 'Dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'Income', label: 'Income Streams', icon: TrendingUp },
    { id: 'Expenses', label: 'Expense Outflows', icon: Receipt },
    { id: 'Investments', label: 'Asset Portfolio', icon: PiggyBank },
    { id: 'Goals', label: 'Financial Milestones', icon: Target },
    { id: 'Simulator', label: 'Monte Carlo Engine', icon: FlaskConical },
    { id: 'Scenarios', label: 'What-If Sandbox', icon: Sliders },
    { id: 'Insights', label: 'Explainable AI', icon: BrainCircuit }
  ];

  return (
    <div className="app-shell">
      {/* Precision Glowing Sidebar */}
      <aside className="app-sidebar">
        <div className="brand-hero">
          <div className="brand-icon-gem">
            <Sparkles size={20} />
          </div>
          <div className="brand-title-wrap">
            <h2>FutureFinance</h2>
            <span>Intelligence 2.0</span>
          </div>
        </div>

        <div style={{ padding: '0 8px 18px' }}>
          <div className="db-live-beacon">
            <span className="beacon-dot" />
            <span>{dbStatus}</span>
          </div>
        </div>

        <nav className="nav-stack">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button className="btn-signout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Stage */}
      <main className="main-stage">
        <header className="top-navbar">
          <div className="header-left">
            <h1>{navItems.find((n) => n.id === activeTab)?.label}</h1>
            <p>3NF Relational Database &bull; Local PostgreSQL &bull; Stochastic Simulation</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={loadData}
              className="btn-gradient"
              style={{ padding: '7px 14px', fontSize: 12.5 }}
              title="Refresh database records"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Sync Records</span>
            </button>

            <div className="profile-chip">
              <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
              <div>
                <div className="user-meta-name">{user.name}</div>
                <div className="user-meta-email">{user.email}</div>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid #f43f5e', color: '#fb7185', padding: '12px 16px', borderRadius: 10, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Dynamic Route Switching */}
        {loading && !dashboardData && !crudRows.length ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>
              Loading financial state from local PostgreSQL...
            </div>
          </div>
        ) : activeTab === 'Dashboard' ? (
          dashboardData ? (
            <Dashboard data={dashboardData} />
          ) : (
            <div>Loading dashboard...</div>
          )
        ) : activeTab === 'Simulator' ? (
          <Simulator />
        ) : activeTab === 'Scenarios' ? (
          <Scenarios scenarios={scenarios} dashboard={dashboardData} onRefresh={loadData} />
        ) : activeTab === 'Insights' ? (
          <Insights insights={insights} />
        ) : (
          <Ledger title={activeTab} rows={crudRows} onRefresh={loadData} />
        )}
      </main>
    </div>
  );
};
