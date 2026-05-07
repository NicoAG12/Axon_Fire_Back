import express from 'express'
import { AlertaController } from '../modules/alerta/alerta.controller';
import { verificarHeaders } from '../middlewares/auth.middleware';

const router = express.Router();
const alertaController = new AlertaController();

router.post('/crear', verificarHeaders, alertaController.crearAlerta);
router.post('/crear-con-notificacion', verificarHeaders, alertaController.crearAlertaYNotificar);
router.get('/rango', verificarHeaders, alertaController.obtenerAlertasPorFecha)
router.get('/:id_alerta', verificarHeaders, alertaController.obtenerAlertaPorID);

export default router;