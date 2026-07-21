import express from 'express';
import { InformesController } from '../modules/informes/informes.controller';
import { verificarHeaders, verificarRolAdmin } from '../middlewares/auth.middleware';

const router = express.Router();
const informesController = new InformesController();

// Cualquier usuario autenticado puede generar el PDF y ver datos
router.get('/:alertaId/pdf', verificarHeaders, informesController.generarPDF);
router.get('/:alertaId/datos', verificarHeaders, informesController.obtenerDatosInforme);
router.patch('/:alertaId/guardar', verificarHeaders, informesController.guardarInforme);
// Solo admin puede gestionar el borrador
/*
router.get('/:alertaId/borrador', verificarHeaders, verificarRolAdmin, informesController.obtenerBorrador);
router.patch('/:alertaId/borrador', verificarHeaders, verificarRolAdmin, informesController.actualizarBorrador);
*/

export default router;
