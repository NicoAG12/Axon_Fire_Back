import express from 'express'
import { AlertaController } from '../modules/alerta/alerta.controller';
const router = express.Router();
const alertaController = new AlertaController();

router.post('/crear', alertaController.crearAlerta);
router.get('/rango', alertaController.obtenerAlertasPorFecha)

export default router;