import { Router } from "express";
import { NotificacionesController } from "../modules/notificaciones/notificaciones.controller";

const router = Router();
const controller = new NotificacionesController();

router.post("/registrar-token", controller.registrarToken);

export default router;