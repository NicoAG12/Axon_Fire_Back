import express from 'express';
import { MetricasController } from '../modules/metricas/metricas.controller';
import { verificarHeaders, verificarRolAdmin } from '../middlewares/auth.middleware';

const router = express.Router();
const metricasController = new MetricasController();

router.get('/mensuales', verificarHeaders, verificarRolAdmin, metricasController.obtenerMetricasMensuales);

export default router;
