import express from 'express'
import { AlertaController } from '../modules/alerta/alerta.controller';
import { verificarHeaders, verificarRolAdmin } from '../middlewares/auth.middleware';

const router = express.Router();
const alertaController = new AlertaController();

router.post('/crear', verificarHeaders, alertaController.crearAlerta);
router.post('/crear-con-notificacion', verificarHeaders, alertaController.crearAlertaYNotificar);
router.post('/rango', verificarHeaders, alertaController.obtenerAlertasPorFecha)
router.get('/usuario/:id_usuario', verificarHeaders, alertaController.obtenerAlertasPorUsuario)
router.get('/:id_alerta', verificarHeaders, alertaController.obtenerAlertaPorID);
router.patch('/:id_alerta/finalizar', verificarHeaders, verificarRolAdmin, alertaController.finalizarAlerta);
router.delete('/limpiar', verificarHeaders, verificarRolAdmin, alertaController.limpiarTodo);

export default router;