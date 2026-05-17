import { Router } from "express";
import { CamionesInventarioController } from "../modules/camiones_inventario/camiones_inventario.controller";
import { verificarHeaders } from "../middlewares/auth.middleware";

const router = Router();
const controller = new CamionesInventarioController();

router.post("/", verificarHeaders, controller.agregarInventario);
router.get("/camion/:camionId", verificarHeaders, controller.obtenerPorCamion);
router.get("/camion/:camionId/agrupado", verificarHeaders, controller.obtenerPorCamionAgrupado);
router.patch("/:id", verificarHeaders, controller.actualizar);
router.delete("/:id", verificarHeaders, controller.eliminar);

export default router;