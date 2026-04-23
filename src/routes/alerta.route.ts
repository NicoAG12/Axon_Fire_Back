import express from 'express'
import { AlertaController } from '../modules/alerta/alerta.controller';
const router = express.Router();
const alertaController = new AlertaController();

router.post('/crear', alertaController.crearAlerta);
router.post('/crear-con-notificacion', alertaController.crearAlertaYNotificar);
router.get('/rango', alertaController.obtenerAlertasPorFecha)
router.get('/:id_alerta', alertaController.obtenerAlertaPorID);

export default router;