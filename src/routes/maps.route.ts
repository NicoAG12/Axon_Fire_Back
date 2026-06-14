import express from 'express';
import { MapsController } from '../modules/maps/maps.controller';
import { verificarHeaders } from '../middlewares/auth.middleware';

const router = express.Router();
const controller = new MapsController();

router.get('/config', verificarHeaders, controller.getConfig);
router.get('/incidents/:id', verificarHeaders, controller.getIncident);

export default router;
