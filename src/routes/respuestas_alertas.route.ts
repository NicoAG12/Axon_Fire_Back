import { Router } from "express";
import { RespuestasAlertasController } from "../modules/respuestas_alertas/respuestas_alertas.controller";

const router = Router();
const controller = new RespuestasAlertasController();

router.post("/", controller.crearRespuesta);
router.get("/", controller.obtenerRespuestas);
router.get("/:id", controller.obtenerRespuestaPorId);
router.put("/:id", controller.actualizarRespuesta);
router.delete("/:id", controller.eliminarRespuesta);

export default router;
