import express from 'express'
import { AlertaController } from '../modules/alerta/alerta.controller';
const router = express.Router();
const alertaController = new AlertaController();

router.post('/crear', alertaController.crearAlerta);

export default router;