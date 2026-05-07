import { Router } from "express";
import { RespuestasAlertasController } from "../modules/respuestas_alertas/respuestas_alertas.controller";

const router = Router();
const controller = new RespuestasAlertasController();

router.get("/:id_alerta", controller.obtenerRespuestasPorAlerta);
router.delete("/:id", controller.eliminarRespuesta);
router.post("/responder/:alerta_id/:usuario_id", controller.responderAviso);

export default router;
