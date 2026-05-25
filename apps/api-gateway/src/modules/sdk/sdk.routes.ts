import { Router, type Router as IRouter } from 'express';
import { SDKController } from './sdk.controller.js';
import { sdkAuth } from '../../middleware/sdk-auth.js';
import { validate } from '../../middleware/validate.js';
import { rateLimiter } from '../../middleware/rate-limiter.js';
import { SDKInitSchema, SDKValidateSchema, SDKHeartbeatSchema, SDKTelemetrySchema } from './sdk.validator.js';

const router: IRouter = Router();
const controller = new SDKController();

// All SDK routes use API key + HMAC auth (not JWT)
router.use(rateLimiter('sdk'));
router.use(sdkAuth);

router.post('/init', validate(SDKInitSchema), (req, res, next) => {
  controller.init(req, res).catch(next);
});

router.post('/validate', validate(SDKValidateSchema), (req, res, next) => {
  controller.validate(req, res).catch(next);
});

router.post('/heartbeat', validate(SDKHeartbeatSchema), (req, res, next) => {
  controller.heartbeat(req, res).catch(next);
});

router.post('/telemetry', validate(SDKTelemetrySchema), (req, res, next) => {
  controller.telemetry(req, res).catch(next);
});

export { router as sdkRoutes };
