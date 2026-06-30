import type { Request, Response } from 'express';
import { ConfigModel } from '@/database';
import { NotFoundError } from '../../core/errors/index.js';

export class ConfigController {
  async getConfig(req: Request, res: Response): Promise<void> {
    const { projectId } = req.params;
    let config = await ConfigModel.findOne({ projectId }).lean();
    if (!config) {
      // Create default config if not exists
      const newConfig = await ConfigModel.create({
        tenantId: req.auth!.orgId,
        projectId,
        version: 1,
        maintenance: { enabled: false },
        killSwitch: { enabled: false },
        notifications: [],
      });
      config = newConfig.toObject() as any;
    }
    
    res.json({ success: true, data: config });
  }

  async updateConfig(req: Request, res: Response): Promise<void> {
    const { projectId } = req.params;
    const updateData = req.body;
    
    let config = await ConfigModel.findOne({ projectId });
    if (!config) {
      throw new NotFoundError('Config not found');
    }

    if (updateData.notifications !== undefined) {
      config.notifications = updateData.notifications;
    }

    await config.save();
    res.json({ success: true, data: config });
  }

  async activateKillSwitch(req: Request, res: Response): Promise<void> {
    const { projectId } = req.params;
    const { reason } = req.body;

    const config = await ConfigModel.findOne({ projectId });
    if (!config) throw new NotFoundError('Config not found');

    config.killSwitch = {
      enabled: true,
      reason: reason || 'Emergency shutdown',
      activatedAt: new Date() as any, // Type assertion for schema
    };

    await config.save();
    res.json({ success: true, data: config });
  }

  async deactivateKillSwitch(req: Request, res: Response): Promise<void> {
    const { projectId } = req.params;

    const config = await ConfigModel.findOne({ projectId });
    if (!config) throw new NotFoundError('Config not found');

    config.killSwitch = {
      enabled: false,
    };

    await config.save();
    res.json({ success: true, data: config });
  }

  async toggleMaintenance(req: Request, res: Response): Promise<void> {
    const { projectId } = req.params;
    const { enabled, message } = req.body;

    const config = await ConfigModel.findOne({ projectId });
    if (!config) throw new NotFoundError('Config not found');

    config.maintenance = {
      enabled,
      message: message || (enabled ? 'Undergoing maintenance' : undefined),
    };

    await config.save();
    res.json({ success: true, data: config });
  }
}
