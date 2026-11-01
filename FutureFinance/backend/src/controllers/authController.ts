import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { DataService } from '../services/dataService.js';
import { generateToken, AuthenticatedRequest } from '../middleware/auth.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(1, 'Password is required')
});

export const AuthController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ detail: parsed.error.errors[0].message });
        return;
      }
      const { name, email, password } = parsed.data;

      const existing = await DataService.findUserByEmail(email);
      if (existing) {
        res.status(409).json({ detail: 'Email already registered' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await DataService.createUser(name, email, passwordHash);
      const token = generateToken(user);

      res.status(201).json({
        access_token: token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (err: any) {
      console.error('[Auth Register Error]:', err);
      res.status(500).json({ detail: 'Failed to complete registration' });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ detail: parsed.error.errors[0].message });
        return;
      }
      const { email, password } = parsed.data;

      const user = await DataService.findUserByEmail(email);
      if (!user) {
        res.status(401).json({ detail: 'Incorrect email or password' });
        return;
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        res.status(401).json({ detail: 'Incorrect email or password' });
        return;
      }

      const token = generateToken(user);
      res.json({
        access_token: token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (err: any) {
      console.error('[Auth Login Error]:', err);
      res.status(500).json({ detail: 'Authentication failed' });
    }
  },

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ detail: 'Unauthorized' });
        return;
      }
      const user = await DataService.findUserById(req.user.id);
      if (!user) {
        res.status(404).json({ detail: 'User account not found' });
        return;
      }
      const profile = await DataService.getProfile(user.id);
      res.json({ user, profile });
    } catch (err: any) {
      res.status(500).json({ detail: 'Failed to fetch user context' });
    }
  }
};
