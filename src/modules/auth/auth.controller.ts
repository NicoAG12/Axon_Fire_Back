import { Request, Response } from 'express'
import { AuthService } from '../auth/auth.service'
import { loginDTO } from '../users/DTO/loginDTO';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    login = async (req: Request, res: Response) => {
        try {
            const data: loginDTO = req.body;
            const usuarioLogueado = await this.authService.login(data);
            const token = await this.authService.generarToken({ id_usuario: usuarioLogueado.id, rol: usuarioLogueado.rol });
            return res.json({
                id: usuarioLogueado.id,
                rol: usuarioLogueado.rol,
                token,
                msj: "Usuario Logueado Correctamente"
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }
}