import { Router } from "express";
import { BolsosInventarioController } from "../modules/bolsos_inventario/bolsos_inventario.controller";
import { verificarHeaders } from "../middlewares/auth.middleware";

const router = Router();
const controller = new BolsosInventarioController();

router.post("/", verificarHeaders, controller.agregarInventario);
router.get("/bolso/:bolsoId", verificarHeaders, controller.obtenerPorBolso);
router.patch("/:id", verificarHeaders, controller.actualizar);
router.delete("/:id", verificarHeaders, controller.eliminar);

export default router;