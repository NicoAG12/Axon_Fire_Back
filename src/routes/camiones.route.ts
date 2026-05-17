import { Router } from "express";
import { CamionesController } from "../modules/camiones/camiones.controller";
import { verificarHeaders } from "../middlewares/auth.middleware";

const router = Router();
const controller = new CamionesController();

router.get("/", verificarHeaders, controller.obtenerTodos);
router.get("/activos", verificarHeaders, controller.obtenerActivos);
router.get("/:id", verificarHeaders, controller.obtenerPorId);
router.post("/", verificarHeaders, controller.crear);
router.patch("/:id", verificarHeaders, controller.actualizar);
router.delete("/:id", verificarHeaders, controller.eliminar);

export default router;