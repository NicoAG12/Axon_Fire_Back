import express from 'express'
import { UsuarioController } from '../modules/users/user.controller'
import { verificarHeaders, verificarRolAdmin } from '../middlewares/auth.middleware'

const router = express.Router();
const usuarioController = new UsuarioController();

router.post('/crear', verificarHeaders, usuarioController.crearUsuario);
router.get('/bomberos', verificarHeaders, verificarRolAdmin, usuarioController.obtenerBomberos);

export default router;