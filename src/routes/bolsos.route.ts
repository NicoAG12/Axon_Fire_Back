import { Router } from "express";
import { BolsosController } from "../modules/bolsos/bolsos.controller";
import { verificarHeaders } from "../middlewares/auth.middleware";

const router = Router();
const controller = new BolsosController();

router.get("/", verificarHeaders, controller.obtenerTodos);
router.get("/:id", verificarHeaders, controller.obtenerPorId);
router.post("/", verificarHeaders, controller.crear);
router.patch("/:id", verificarHeaders, controller.actualizar);
router.delete("/:id", verificarHeaders, controller.eliminar);

export default router;