import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { DataService } from '../services/dataService.js';
import { runSimulation } from '../services/simulationService.js';

const simSchema = z.object({
  initial_amount: z.number().min(0, 'Initial amount must be non-negative'),
  monthly_contribution: z.number().min(0, 'Monthly contribution must be non-negative'),
  annual_return: z.number().min(-50).max(100, 'Annual return must be between -50% and 100%'),
  volatility: z.number().min(0).max(100, 'Volatility must be between 0% and 100%'),
  years: z.number().int().min(1).max(50, 'Years must be between 1 and 50'),
  simulations: z.number().int().min(100).max(20000).default(5000),
  goal_target: z.number().min(0).nullable().optional()
});

const scenarioSchema = z.object({
  name: z.string().min(1, 'Scenario name required'),
  income_change_pct: z.number().default(0),
  expense_change_pct: z.number().default(0),
  contribution_change: z.number().default(0)
});

export const SimulationController = {
  async run(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const parsed = simSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ detail: parsed.error.errors[0].message });
        return;
      }
      const p = parsed.data;

      const record = await DataService.insertRow<any>('simulation_runs', userId, {
        initial_amount: p.initial_amount,
        monthly_contribution: p.monthly_contribution,
        annual_return: p.annual_return,
        volatility: p.volatility,
        years: p.years,
        simulations: p.simulations,
        goal_target: p.goal_target || null
      });

      const result = runSimulation(
        p.initial_amount,
        p.monthly_contribution,
        p.annual_return,
        p.volatility,
        p.years,
        p.simulations,
        p.goal_target || null
      );

      res.json({
        run_id: record.id,
        ...result
      });
    } catch (err: any) {
      console.error('[Simulation Run Error]:', err);
      res.status(500).json({ detail: 'Failed to execute Monte Carlo simulation' });
    }
  },

  async getOne(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const runId = parseInt(req.params.id, 10);
      const record = await DataService.getRowById<any>('simulation_runs', runId, userId);
      if (!record) {
        res.status(404).json({ detail: 'Simulation run not found' });
        return;
      }

      const result = runSimulation(
        Number(record.initial_amount),
        Number(record.monthly_contribution),
        Number(record.annual_return),
        Number(record.volatility),
        Number(record.years),
        Number(record.simulations),
        record.goal_target ? Number(record.goal_target) : null
      );

      res.json({
        run_id: record.id,
        ...result
      });
    } catch (err: any) {
      res.status(500).json({ detail: 'Failed to retrieve simulation' });
    }
  },

  async listScenarios(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const scenarios = await DataService.getRows('scenarios', userId);
      res.json(scenarios);
    } catch (err: any) {
      res.status(500).json({ detail: 'Failed to list scenarios' });
    }
  },

  async createScenario(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const parsed = scenarioSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ detail: parsed.error.errors[0].message });
        return;
      }
      const scenario = await DataService.insertRow('scenarios', userId, parsed.data);
      res.status(201).json(scenario);
    } catch (err: any) {
      res.status(400).json({ detail: 'Failed to create scenario' });
    }
  }
};
