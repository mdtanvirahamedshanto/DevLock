import type { Request, Response } from 'express';
import { LicenseService } from './license.service.js';

const licenseService = new LicenseService();

export class LicenseController {
  async create(req: Request, res: Response): Promise<void> {
    const license = await licenseService.create(
      req.auth!.orgId,
      req.params['projectId']!,
      req.body,
    );

    res.status(201).json({ success: true, data: license });
  }

  async list(req: Request, res: Response): Promise<void> {
    const result = await licenseService.list(
      req.auth!.orgId,
      req.params['projectId']!,
      req.query as any,
    );

    res.json({ success: true, ...result });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const license = await licenseService.getById(
      req.auth!.orgId,
      req.params['projectId']!,
      req.params['licenseId']!,
    );

    res.json({ success: true, data: license });
  }

  async suspend(req: Request, res: Response): Promise<void> {
    const result = await licenseService.suspend(
      req.auth!.orgId,
      req.params['projectId']!,
      req.params['licenseId']!,
      req.body.reason,
    );

    res.json({ success: true, data: result });
  }

  async revoke(req: Request, res: Response): Promise<void> {
    const result = await licenseService.revoke(
      req.auth!.orgId,
      req.params['projectId']!,
      req.params['licenseId']!,
      req.body.reason ?? 'Revoked by admin',
    );

    res.json({ success: true, data: result });
  }

  async reactivate(req: Request, res: Response): Promise<void> {
    const result = await licenseService.reactivate(
      req.auth!.orgId,
      req.params['projectId']!,
      req.params['licenseId']!,
    );

    res.json({ success: true, data: result });
  }
}
