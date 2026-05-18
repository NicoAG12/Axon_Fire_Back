import { Router } from 'express';
import { ChecklistCuartelController } from '../modules/checklist_cuartel/checklist_cuartel.controller';
import { verificarHeaders } from '../middlewares/auth.middleware';

const router = Router();
const controller = new ChecklistCuartelController();

router.post('/', verificarHeaders, controller.crearChecklist);
router.get('/', verificarHeaders, controller.obtenerHistorial);
router.get('/:id', verificarHeaders, controller.obtenerDetalle);
router.post('/recordatorio', verificarHeaders, controller.enviarRecordatorio)
export default router;