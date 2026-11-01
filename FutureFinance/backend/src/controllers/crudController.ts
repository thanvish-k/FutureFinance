import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { DataService } from '../services/dataService.js';

export function createCrudController(tableName: string) {
  return {
    async list(req: AuthenticatedRequest, res: Response): Promise<void> {
      try {
        const userId = req.user!.id;
        const rows = await DataService.getRows(tableName, userId);
        res.json(rows);
      } catch (err: any) {
        console.error(`[List ${tableName} Error]:`, err);
        res.status(500).json({ detail: `Failed to fetch ${tableName}` });
      }
    },

    async getOne(req: AuthenticatedRequest, res: Response): Promise<void> {
      try {
        const userId = req.user!.id;
        const id = parseInt(req.params.id, 10);
        const row = await DataService.getRowById(tableName, id, userId);
        if (!row) {
          res.status(404).json({ detail: 'Record not found' });
          return;
        }
        res.json(row);
      } catch (err: any) {
        res.status(500).json({ detail: 'Failed to retrieve record' });
      }
    },

    async create(req: AuthenticatedRequest, res: Response): Promise<void> {
      try {
        const userId = req.user!.id;
        const data = req.body;
        const newRecord = await DataService.insertRow(tableName, userId, data);
        res.status(201).json(newRecord);
      } catch (err: any) {
        console.error(`[Create ${tableName} Error]:`, err);
        res.status(400).json({ detail: err.message || `Failed to create ${tableName} record` });
      }
    },

    async update(req: AuthenticatedRequest, res: Response): Promise<void> {
      try {
        const userId = req.user!.id;
        const id = parseInt(req.params.id, 10);
        const data = req.body;
        const updated = await DataService.updateRow(tableName, id, userId, data);
        if (!updated) {
          res.status(404).json({ detail: 'Record not found' });
          return;
        }
        res.json(updated);
      } catch (err: any) {
        console.error(`[Update ${tableName} Error]:`, err);
        res.status(400).json({ detail: err.message || `Failed to update ${tableName} record` });
      }
    },

    async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
      try {
        const userId = req.user!.id;
        const id = parseInt(req.params.id, 10);
        const success = await DataService.deleteRow(tableName, id, userId);
        if (!success) {
          res.status(404).json({ detail: 'Record not found' });
          return;
        }
        res.json({ deleted: true, id });
      } catch (err: any) {
        console.error(`[Delete ${tableName} Error]:`, err);
        res.status(500).json({ detail: `Failed to delete record` });
      }
    }
  };
}
