import { Router, type Router as IRouter } from 'express';
import { LicenseController } from './license.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  CreateLicenseSchema,
  ListLicensesSchema,
  SuspendLicenseSchema,
} from './license.validator.js';

const router: IRouter = Router({ mergeParams: true });
const controller = new LicenseController();

// All license routes require authentication
router.use(authenticate);

router.get('/', authorize('license:read'), validate(ListLicensesSchema), (req, res, next) => {
  controller.list(req, res).catch(next);
});

router.post('/', authorize('license:create'), validate(CreateLicenseSchema), (req, res, next) => {
  controller.create(req, res).catch(next);
});

router.get('/:licenseId', authorize('license:read'), (req, res, next) => {
  controller.getById(req, res).catch(next);
});

router.post('/:licenseId/suspend', authorize('license:suspend'), validate(SuspendLicenseSchema), (req, res, next) => {
  controller.suspend(req, res).catch(next);
});

router.post('/:licenseId/revoke', authorize('license:revoke'), (req, res, next) => {
  controller.revoke(req, res).catch(next);
});

router.post('/:licenseId/reactivate', authorize('license:suspend'), (req, res, next) => {
  controller.reactivate(req, res).catch(next);
});

export { router as licenseRoutes };
