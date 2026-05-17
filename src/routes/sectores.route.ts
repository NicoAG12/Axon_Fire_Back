import { Router } from "express";
import { SectoresController } from "../modules/sectores/sectores.controller"
import { verificarHeaders } from "../middlewares/auth.middleware";

const router = Router();
const controller = new SectoresController();

router.post("/", verificarHeaders, controller.crear);
router.get("/camion/:camionId", verificarHeaders, controller.obtenerPorCamion);
router.delete("/:id", verificarHeaders, controller.eliminar);

export default router;