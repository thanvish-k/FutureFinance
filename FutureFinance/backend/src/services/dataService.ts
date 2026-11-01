import { pool, isUsingPostgres, memoryStore } from '../config/db.js';
import {
  User,
  FinancialProfile,
  Income,
  Expense,
  Investment,
  Goal,
  Loan,
  Scenario,
  SimulationRun
} from '../types/index.js';

export const DataService = {
  // USER OPERATIONS
  async findUserByEmail(email: string): Promise<User | null> {
    if (isUsingPostgres()) {
      const res = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
      return res.rows[0] || null;
    }
    const u = memoryStore.users.find((x) => x.email.toLowerCase() === email.toLowerCase().trim());
    return u || null;
  },

  async findUserById(id: number): Promise<User | null> {
    if (isUsingPostgres()) {
      const res = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    const u = memoryStore.users.find((x) => x.id === id);
    if (!u) return null;
    const { password_hash, ...rest } = u;
    return rest as User;
  },

  async createUser(name: string, email: string, passwordHash: string): Promise<User> {
    const cleanEmail = email.toLowerCase().trim();
    if (isUsingPostgres()) {
      const userRes = await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
        [name.trim(), cleanEmail, passwordHash, 'user']
      );
      const user = userRes.rows[0];
      await pool.query('INSERT INTO financial_profiles (user_id) VALUES ($1)', [user.id]);
      return user;
    }
    const newId = memoryStore.nextId.users++;
    const user: User = {
      id: newId,
      name: name.trim(),
      email: cleanEmail,
      password_hash: passwordHash,
      role: 'user',
      created_at: new Date().toISOString()
    };
    memoryStore.users.push(user);
    memoryStore.financial_profiles.push({
      id: memoryStore.nextId.financial_profiles++,
      user_id: newId,
      age: 28,
      monthly_income: 0,
      savings: 0,
      risk_tolerance: 'moderate',
      updated_at: new Date().toISOString()
    });
    return user;
  },

  // FINANCIAL PROFILE
  async getProfile(userId: number): Promise<FinancialProfile | null> {
    if (isUsingPostgres()) {
      const res = await pool.query('SELECT * FROM financial_profiles WHERE user_id = $1', [userId]);
      return res.rows[0] || null;
    }
    return memoryStore.financial_profiles.find((p) => p.user_id === userId) || null;
  },

  // GENERIC CRUD HELPERS
  async getRows<T>(tableName: string, userId: number): Promise<T[]> {
    if (isUsingPostgres()) {
      const res = await pool.query(`SELECT * FROM ${tableName} WHERE user_id = $1 ORDER BY id DESC`, [userId]);
      return res.rows;
    }
    const storeArray = (memoryStore as any)[tableName] as any[];
    return (storeArray || []).filter((r) => r.user_id === userId).reverse();
  },

  async getRowById<T>(tableName: string, id: number, userId: number): Promise<T | null> {
    if (isUsingPostgres()) {
      const res = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1 AND user_id = $2`, [id, userId]);
      return res.rows[0] || null;
    }
    const storeArray = (memoryStore as any)[tableName] as any[];
    const item = (storeArray || []).find((r) => r.id === id && r.user_id === userId);
    return item || null;
  },

  async insertRow<T>(tableName: string, userId: number, data: Record<string, any>): Promise<T> {
    if (isUsingPostgres()) {
      const keys = ['user_id', ...Object.keys(data)];
      const values = [userId, ...Object.values(data)];
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      const query = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const res = await pool.query(query, values);
      return res.rows[0];
    }
    const nextId = (memoryStore.nextId as any)[tableName]++;
    const record = { id: nextId, user_id: userId, ...data };
    const storeArray = (memoryStore as any)[tableName] as any[];
    storeArray.push(record);

    // Audit log simulation in memory
    memoryStore.audit_logs.push({
      id: memoryStore.nextId.audit_logs++,
      user_id: userId,
      action: 'INSERT',
      table_name: tableName,
      record_id: nextId,
      details: data,
      created_at: new Date().toISOString()
    });

    return record as T;
  },

  async updateRow<T>(tableName: string, id: number, userId: number, data: Record<string, any>): Promise<T | null> {
    if (isUsingPostgres()) {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const query = `UPDATE ${tableName} SET ${setClauses} WHERE id = $${keys.length + 1} AND user_id = $${keys.length + 2} RETURNING *`;
      const res = await pool.query(query, [...values, id, userId]);
      return res.rows[0] || null;
    }
    const storeArray = (memoryStore as any)[tableName] as any[];
    const idx = storeArray.findIndex((r) => r.id === id && r.user_id === userId);
    if (idx === -1) return null;
    storeArray[idx] = { ...storeArray[idx], ...data };
    return storeArray[idx] as T;
  },

  async deleteRow(tableName: string, id: number, userId: number): Promise<boolean> {
    if (isUsingPostgres()) {
      const res = await pool.query(`DELETE FROM ${tableName} WHERE id = $1 AND user_id = $2`, [id, userId]);
      return (res.rowCount || 0) > 0;
    }
    const storeArray = (memoryStore as any)[tableName] as any[];
    const idx = storeArray.findIndex((r) => r.id === id && r.user_id === userId);
    if (idx === -1) return false;
    storeArray.splice(idx, 1);
    return true;
  },

  // ANALYTICS & DASHBOARD AGGREGATIONS
  async getDashboardMetrics(userId: number) {
    if (isUsingPostgres()) {
      const incomeRes = await pool.query(
        'SELECT COALESCE(SUM(amount), 0) AS total FROM income WHERE user_id = $1',
        [userId]
      );
      const expenseRes = await pool.query(
        'SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE user_id = $1',
        [userId]
      );
      const investRes = await pool.query(
        'SELECT COALESCE(SUM(current_value), 0) AS total FROM investments WHERE user_id = $1',
        [userId]
      );
      const profileRes = await pool.query(
        'SELECT savings, monthly_income FROM financial_profiles WHERE user_id = $1',
        [userId]
      );
      const categoryRes = await pool.query(
        'SELECT category AS name, SUM(amount)::numeric AS value FROM expenses WHERE user_id = $1 GROUP BY category ORDER BY value DESC',
        [userId]
      );
      const loansRes = await pool.query('SELECT * FROM loans WHERE user_id = $1', [userId]);
      const goalsRes = await pool.query('SELECT * FROM financial_goals WHERE user_id = $1', [userId]);

      const monthlyIncome = parseFloat(incomeRes.rows[0].total) || 0;
      const monthlyExpenses = parseFloat(expenseRes.rows[0].total) || 0;
      const portfolioValue = parseFloat(investRes.rows[0].total) || 0;
      const savingsBalance = profileRes.rows[0]?.savings ? parseFloat(profileRes.rows[0].savings) : 0;
      const expenseCategories = categoryRes.rows.map((r) => ({
        name: r.name,
        value: parseFloat(r.value)
      }));

      return {
        monthlyIncome,
        monthlyExpenses,
        portfolioValue,
        savingsBalance,
        expenseCategories,
        loans: loansRes.rows as Loan[],
        goals: goalsRes.rows as Goal[],
        highestCategory: expenseCategories.length > 0 ? expenseCategories[0].name : null
      };
    }

    // Memory Store Aggregation
    const userIncomes = memoryStore.income.filter((i) => i.user_id === userId);
    const userExpenses = memoryStore.expenses.filter((e) => e.user_id === userId);
    const userInvestments = memoryStore.investments.filter((i) => i.user_id === userId);
    const profile = memoryStore.financial_profiles.find((p) => p.user_id === userId);
    const loans = memoryStore.loans.filter((l) => l.user_id === userId);
    const goals = memoryStore.financial_goals.filter((g) => g.user_id === userId);

    const monthlyIncome = userIncomes.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    const monthlyExpenses = userExpenses.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    const portfolioValue = userInvestments.reduce((acc, c) => acc + (Number(c.current_value) || 0), 0);
    const savingsBalance = profile ? Number(profile.savings) || 0 : 0;

    const catMap: Record<string, number> = {};
    for (const exp of userExpenses) {
      catMap[exp.category] = (catMap[exp.category] || 0) + Number(exp.amount || 0);
    }
    const expenseCategories = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      monthlyIncome,
      monthlyExpenses,
      portfolioValue,
      savingsBalance,
      expenseCategories,
      loans,
      goals,
      highestCategory: expenseCategories.length > 0 ? expenseCategories[0].name : null
    };
  }
};
