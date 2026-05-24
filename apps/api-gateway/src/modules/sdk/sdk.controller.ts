import type { Request, Response } from 'express';
import { SDKService } from './sdk.service.js';

const sdkService = new SDKService();

export class SDKController {
  async validate(req: Request, res: Response): Promise<void> {
    const result = await sdkService.validateLicense(req.project!.id, {
      licenseKey: req.body.licenseKey,
      fingerprint: req.body.fingerprint,
      domain: req.body.domain,
      sdkVersion: req.body.sdkVersion,
      environment: req.body.environment,
    });

    res.json({ success: true, data: result });
  }

  async init(req: Request, res: Response): Promise<void> {
    // SDK init — validate license if provided, otherwise just return config
    if (req.body.licenseKey) {
      const result = await sdkService.validateLicense(req.project!.id, {
        licenseKey: req.body.licenseKey,
        fingerprint: req.body.fingerprint,
        domain: req.body.domain,
        sdkVersion: req.body.sdkVersion,
        environment: req.body.environment,
      });
      res.json({ success: true, data: result });
    } else {
      // Return config only (no license validation)
      res.json({
        success: true,
        data: {
          valid: false,
          license: { status: 'none', features: [] },
          config: {
            maintenance: { enabled: false },
            killSwitch: { enabled: false },
            notifications: [],
            featureFlags: {},
          },
          serverTime: Date.now(),
        },
      });
    }
  }

  async heartbeat(req: Request, res: Response): Promise<void> {
    // Acknowledge heartbeat, return any pending config updates
    res.json({
      success: true,
      data: {
        ack: true,
        serverTime: Date.now(),
        // TODO: Check if config version is stale, return updates
      },
    });
  }

  async telemetry(req: Request, res: Response): Promise<void> {
    // Accept telemetry batch (fire-and-forget to queue)
    // TODO: Push to BullMQ telemetry queue
    res.status(202).json({
      success: true,
      data: { accepted: req.body.events?.length ?? 0 },
    });
  }
}
