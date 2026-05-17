import { Router } from "express";
import { CamionesInventarioController } from "./camiones_inventario.controller";
import { verificarHeaders } from "../../middlewares/auth.middleware";

const router = Router();
const controller = new CamionesInventarioController();

router.post("/", verificarHeaders, controller.agregarInventario);
router.get("/camion/:camionId", verificarHeaders, controller.obtenerPorCamion);
router.patch("/:id", verificarHeaders, controller.actualizar);
router.delete("/:id", verificarHeaders, controller.eliminar);

export default router;