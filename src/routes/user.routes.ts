import express from 'express'
import { UsuarioController } from '../modules/users/user.controller'

const router = express.Router();
const usuarioController = new UsuarioController();

router.post('/crear', usuarioController.crearUsuario);

export default router;