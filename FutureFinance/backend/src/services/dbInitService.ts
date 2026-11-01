import bcrypt from 'bcryptjs';
import { pool, isUsingPostgres, memoryStore } from '../config/db.js';
import fs from 'fs';
import path from 'path';

export async function initializeDatabase() {
  const isPg = isUsingPostgres();

  if (isPg) {
    try {
      // Check if users table exists in Postgres
      const checkRes = await pool.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
      );
      const exists = checkRes.rows[0].exists;

      if (!exists) {
        console.log('[Database] Initializing PostgreSQL schema, views, triggers, and seed data...');
        const schemaPath = path.resolve(process.cwd(), '../database/postgres/schema.sql');
        const seedPath = path.resolve(process.cwd(), '../database/postgres/seed.sql');
        const viewsPath = path.resolve(process.cwd(), '../database/postgres/views.sql');
        const procPath = path.resolve(process.cwd(), '../database/postgres/procedures.sql');
        const trigPath = path.resolve(process.cwd(), '../database/postgres/triggers.sql');

        if (fs.existsSync(schemaPath)) {
          await pool.query(fs.readFileSync(schemaPath, 'utf8'));
        }
        if (fs.existsSync(viewsPath)) {
          await pool.query(fs.readFileSync(viewsPath, 'utf8'));
        }
        if (fs.existsSync(procPath)) {
          await pool.query(fs.readFileSync(procPath, 'utf8'));
        }
        if (fs.existsSync(trigPath)) {
          await pool.query(fs.readFileSync(trigPath, 'utf8'));
        }
        if (fs.existsSync(seedPath)) {
          await pool.query(fs.readFileSync(seedPath, 'utf8'));
        }
        console.log('[Database] PostgreSQL database initialized successfully.');
      } else {
        console.log('[Database] PostgreSQL tables already initialized.');
      }
      return;
    } catch (err: any) {
      console.error('[Database] Failed to execute PostgreSQL migration scripts:', err.message);
    }
  }

  // Populate local in-memory fallback store if memoryStore is empty
  if (memoryStore.users.length === 0) {
    console.log('[Database] Seeding embedded local memory store for instant preview...');
    const hashed = await bcrypt.hash('FutureFinance@123', 10);

    const demoUser = {
      id: 1,
      name: 'Demo User',
      email: 'demo@futurefinance.in',
      password_hash: hashed,
      role: 'user',
      created_at: new Date().toISOString()
    };
    const aarav = {
      id: 2,
      name: 'Aarav Sharma',
      email: 'aarav@example.in',
      password_hash: hashed,
      role: 'user',
      created_at: new Date().toISOString()
    };
    memoryStore.users.push(demoUser, aarav);
    memoryStore.nextId.users = 3;

    memoryStore.financial_profiles.push(
      {
        id: 1,
        user_id: 1,
        age: 28,
        monthly_income: 100000,
        savings: 180000,
        risk_tolerance: 'moderate',
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        user_id: 2,
        age: 28,
        monthly_income: 110000,
        savings: 420000,
        risk_tolerance: 'high',
        updated_at: new Date().toISOString()
      }
    );
    memoryStore.nextId.financial_profiles = 3;

    const today = new Date().toISOString().slice(0, 10);
    memoryStore.income.push(
      { id: 1, user_id: 1, source: 'Salary', amount: 85000, received_on: today, description: 'Primary tech employment' },
      { id: 2, user_id: 1, source: 'Freelance', amount: 15000, received_on: today, description: 'Consulting & software advisory' },
      { id: 3, user_id: 2, source: 'Salary', amount: 110000, received_on: today, description: 'Corporate salary' }
    );
    memoryStore.nextId.income = 4;

    memoryStore.expenses.push(
      { id: 1, user_id: 1, category: 'Rent', amount: 25000, spent_on: today, description: 'Apartment lease' },
      { id: 2, user_id: 1, category: 'Food', amount: 9000, spent_on: today, description: 'Groceries & provisions' },
      { id: 3, user_id: 1, category: 'Entertainment', amount: 6000, spent_on: today, description: 'Streaming and dining' },
      { id: 4, user_id: 1, category: 'Utilities', amount: 4500, spent_on: today, description: 'Electricity and fiber' },
      { id: 5, user_id: 2, category: 'Rent', amount: 30000, spent_on: today, description: 'Lease' }
    );
    memoryStore.nextId.expenses = 6;

    memoryStore.investments.push(
      { id: 1, user_id: 1, name: 'Nifty 50 Index Fund', investment_type: 'Mutual Funds', amount_invested: 120000, current_value: 142000, purchase_date: '2023-01-15', expected_return: 11.5, risk_level: 'medium' },
      { id: 2, user_id: 1, name: 'SGB Sovereign Gold', investment_type: 'Gold', amount_invested: 50000, current_value: 58000, purchase_date: '2023-05-01', expected_return: 8.0, risk_level: 'low' },
      { id: 3, user_id: 1, name: 'Bluechip Large Cap ETF', investment_type: 'ETFs', amount_invested: 80000, current_value: 95000, purchase_date: '2023-03-10', expected_return: 12.0, risk_level: 'high' }
    );
    memoryStore.nextId.investments = 4;

    memoryStore.financial_goals.push(
      { id: 1, user_id: 1, name: 'Emergency Fund (6mo)', target_amount: 400000, current_amount: 180000, target_date: '2028-01-01', priority: 'high' },
      { id: 2, user_id: 1, name: 'Europe Study Travel', target_amount: 300000, current_amount: 60000, target_date: '2027-06-01', priority: 'medium' },
      { id: 3, user_id: 1, name: 'Apartment Down Payment', target_amount: 2500000, current_amount: 600000, target_date: '2031-01-01', priority: 'high' }
    );
    memoryStore.nextId.financial_goals = 4;

    memoryStore.loans.push(
      { id: 1, user_id: 1, lender: 'HDFC Bank Personal Loan', outstanding_amount: 180000, monthly_emi: 8500 }
    );
    memoryStore.nextId.loans = 2;

    memoryStore.scenarios.push(
      { id: 1, user_id: 1, name: 'Discretionary Cut 10%', income_change_pct: 0, expense_change_pct: -10, contribution_change: 0, created_at: today },
      { id: 2, user_id: 1, name: 'Accelerated SIP +₹5,000', income_change_pct: 0, expense_change_pct: 0, contribution_change: 5000, created_at: today }
    );
    memoryStore.nextId.scenarios = 3;
    console.log('[Database] Demo dataset seeded in memory.');
  }
}
