import { Router } from "express";
import { RegistrosComunicacionController } from "../modules/registros_comunicacion/registros_comunicacion.controller";
import { verificarHeaders } from "../middlewares/auth.middleware";

const router = Router();
const controller = new RegistrosComunicacionController();

router.post("/crear", verificarHeaders, controller.crearRegistro);
router.get("/alerta/:id_alerta", verificarHeaders, controller.obtenerRegistrosPorAlerta);

export default router;