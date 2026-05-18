import { Router } from 'express';
import { ChecklistCuartelController } from './checklist_cuartel.controller';

const router = Router();
const controller = new ChecklistCuartelController();

router.post('/', controller.crearChecklist);
router.get('/', controller.obtenerHistorial);
router.get('/:id', controller.obtenerDetalle);

export default router;