import { Router } from "express";
import { MantenimientoHerramientasController } from "../modules/mantenimiento_herramientas/mantenimiento_herramientas.controller";
import { verificarHeaders } from "../middlewares/auth.middleware";

const router = Router();
const controller = new MantenimientoHerramientasController();

router.post("/guardar", verificarHeaders, controller.guardarMantenimiento);
router.get("/historial/:herramientaId", verificarHeaders, controller.obtenerHistorial);

export default router;
