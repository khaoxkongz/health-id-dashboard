import { Router } from 'express';

import HealthIdDashboardRepository from '../repositories/health-id-dashboard';
import HealthIdDashboardUsecase from '../usecases/health-id-dashboard';
import HealthIdDashboardHandler from '../handlers/health-id-dashboard';

const repository = new HealthIdDashboardRepository();
const usecase = new HealthIdDashboardUsecase(repository);
const handler = new HealthIdDashboardHandler(usecase);

const healthIdDashboardRouter = Router();

healthIdDashboardRouter.post('/fetch/geo-locations', handler.fetchGeolocation);
healthIdDashboardRouter.post('/fetch/tooltips', handler.fetchTooltip);
healthIdDashboardRouter.post('/fetch/barcharts', handler.fetchBarchart);
healthIdDashboardRouter.post('/fetch/tables', handler.fecthTable);

export default healthIdDashboardRouter;
