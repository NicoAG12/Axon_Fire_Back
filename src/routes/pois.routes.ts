import express from 'express';
import { PoisController } from '../modules/pois/pois.controller';
import { verificarHeaders, verificarRolAdmin } from '../middlewares/auth.middleware';

const router = express.Router();
const controller = new PoisController();

router.get('/', verificarHeaders, verificarRolAdmin, controller.obtenerPOIs);
router.post('/', verificarHeaders, verificarRolAdmin, controller.crearPOI);
router.patch('/:id', verificarHeaders, verificarRolAdmin, controller.actualizarPOI);
router.delete('/:id', verificarHeaders, verificarRolAdmin, controller.eliminarPOI);

export default router;
