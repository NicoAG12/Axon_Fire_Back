import { Router } from "express";
import { RegistrosComunicacionController } from "../modules/registros_comunicacion/registros_comunicacion.controller";

const router = Router();
const controller = new RegistrosComunicacionController();

router.post("/crear", controller.crearRegistro);
router.get("/alerta/:id_alerta", controller.obtenerRegistrosPorAlerta);

export default router;