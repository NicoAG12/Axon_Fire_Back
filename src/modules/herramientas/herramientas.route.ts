import { Router } from "express";
import { HerramientasController } from "./herramientas.controller";
import { verificarHeaders } from "../../middlewares/auth.middleware";

const router = Router();
const controller = new HerramientasController();

router.get("/", verificarHeaders, controller.obtenerTodos);
router.get("/:id", verificarHeaders, controller.obtenerPorId);
router.post("/", verificarHeaders, controller.crear);
router.patch("/:id", verificarHeaders, controller.actualizar);
router.delete("/:id", verificarHeaders, controller.eliminar);

export default router;