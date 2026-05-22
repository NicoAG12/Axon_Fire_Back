import { Router } from "express";
import { NotificacionesController } from "../modules/notificaciones/notificaciones.controller";
import { verificarHeaders } from "../middlewares/auth.middleware";

const router = Router();
const controller = new NotificacionesController();

router.post("/registrar-token", verificarHeaders, controller.registrarToken);
router.get("/mis-tokens", verificarHeaders, controller.obtenerMisTokens);

export default router;
