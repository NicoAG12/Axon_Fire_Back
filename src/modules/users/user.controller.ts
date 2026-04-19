import { Request, Response } from 'express'
import { UsuarioService } from './user.service'
import { crearUsuarioDTO } from './DTO/CrearUsuarioDTO'

export class UsuarioController {
    private usuarioService: UsuarioService;

    constructor() {
        this.usuarioService = new UsuarioService();
    }

    crearUsuario = async (req: Request, res: Response) => {
        try {
            const data: crearUsuarioDTO = req.body;
            const nuevoUsuario = await this.usuarioService.crearUsuario(data);
            if (nuevoUsuario.bombero) {
                return res.json({
                    id: nuevoUsuario.id,
                    nombre_usuario: nuevoUsuario.nombre_usuario,
                    rol: nuevoUsuario.rol,
                    msj: "Bombero creado exitosamente"
                })
            }
            return res.json({ id: nuevoUsuario.id, nombre_usuario: nuevoUsuario.nombre_usuario, rol: nuevoUsuario.rol });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}