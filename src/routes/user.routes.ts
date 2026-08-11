import express from 'express'
import { UsuarioController } from '../modules/users/user.controller'
import { verificarHeaders, verificarRolAdmin } from '../middlewares/auth.middleware'

const router = express.Router();
const usuarioController = new UsuarioController();

router.post('/crear', verificarHeaders, verificarRolAdmin, usuarioController.crearUsuario);
router.get('/bomberos', verificarHeaders, verificarRolAdmin, usuarioController.obtenerBomberos);
router.patch('/:id/toggle-activo', verificarHeaders, verificarRolAdmin, usuarioController.toggleActivo);

export default router;