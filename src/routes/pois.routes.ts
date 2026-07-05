import express from 'express';
import { PoisController } from '../modules/pois/pois.controller';
import { verificarHeaders, verificarRolAdmin } from '../middlewares/auth.middleware';
import { validateData } from '../middlewares/validateData.middleware';
import { crearPoiSchema, actualizarPoiSchema } from '../modules/pois/DTO/pois_dto';

const router = express.Router();
const controller = new PoisController();

router.get('/', verificarHeaders, controller.obtenerPOIs);
router.post('/', verificarHeaders, verificarRolAdmin, validateData(crearPoiSchema), controller.crearPOI);
router.patch('/:id', verificarHeaders, verificarRolAdmin, validateData(actualizarPoiSchema), controller.actualizarPOI);
router.delete('/:id', verificarHeaders, verificarRolAdmin, controller.eliminarPOI);

export default router;
