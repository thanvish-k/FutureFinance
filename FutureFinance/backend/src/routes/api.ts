import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { createCrudController } from '../controllers/crudController.js';
import { AnalyticsController } from '../controllers/analyticsController.js';
import { SimulationController } from '../controllers/simulationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public Authentication Endpoints
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', requireAuth, AuthController.me);

// Analytics & Explainable AI
router.get('/dashboard', requireAuth, AnalyticsController.getDashboard);
router.get('/financial-health', requireAuth, AnalyticsController.getFinancialHealth);
router.get('/insights', requireAuth, AnalyticsController.getInsights);

// Monte Carlo Simulations & Scenarios
router.post('/simulation/run', requireAuth, SimulationController.run);
router.get('/simulation/:id', requireAuth, SimulationController.getOne);
router.get('/scenarios', requireAuth, SimulationController.listScenarios);
router.post('/scenarios', requireAuth, SimulationController.createScenario);

// Protected CRUD Resources
const incomeCtrl = createCrudController('income');
router.get('/income', requireAuth, incomeCtrl.list);
router.post('/income', requireAuth, incomeCtrl.create);
router.get('/income/:id', requireAuth, incomeCtrl.getOne);
router.put('/income/:id', requireAuth, incomeCtrl.update);
router.delete('/income/:id', requireAuth, incomeCtrl.delete);

const expenseCtrl = createCrudController('expenses');
router.get('/expenses', requireAuth, expenseCtrl.list);
router.post('/expenses', requireAuth, expenseCtrl.create);
router.get('/expenses/:id', requireAuth, expenseCtrl.getOne);
router.put('/expenses/:id', requireAuth, expenseCtrl.update);
router.delete('/expenses/:id', requireAuth, expenseCtrl.delete);

const investmentCtrl = createCrudController('investments');
router.get('/investments', requireAuth, investmentCtrl.list);
router.post('/investments', requireAuth, investmentCtrl.create);
router.get('/investments/:id', requireAuth, investmentCtrl.getOne);
router.put('/investments/:id', requireAuth, investmentCtrl.update);
router.delete('/investments/:id', requireAuth, investmentCtrl.delete);

const goalCtrl = createCrudController('financial_goals');
router.get('/goals', requireAuth, goalCtrl.list);
router.post('/goals', requireAuth, goalCtrl.create);
router.get('/goals/:id', requireAuth, goalCtrl.getOne);
router.put('/goals/:id', requireAuth, goalCtrl.update);
router.delete('/goals/:id', requireAuth, goalCtrl.delete);

const loanCtrl = createCrudController('loans');
router.get('/loans', requireAuth, loanCtrl.list);
router.post('/loans', requireAuth, loanCtrl.create);
router.get('/loans/:id', requireAuth, loanCtrl.getOne);
router.put('/loans/:id', requireAuth, loanCtrl.update);
router.delete('/loans/:id', requireAuth, loanCtrl.delete);

export default router;
