import { Router } from "express";
import { RespuestasAlertasController } from "../modules/respuestas_alertas/respuestas_alertas.controller";
import { verificarHeaders, verificarRolAdmin } from "../middlewares/auth.middleware";

const router = Router();
const controller = new RespuestasAlertasController();

router.get("/:id_alerta", verificarHeaders, controller.obtenerRespuestasPorAlerta);
router.get("/:id_alerta/asistencias/count", verificarHeaders, controller.obtenerCantidadAsistentes);
router.delete("/:id", verificarHeaders, verificarRolAdmin, controller.eliminarRespuesta);
router.post("/responder/:alerta_id", verificarHeaders, controller.responderAviso);

export default router;
