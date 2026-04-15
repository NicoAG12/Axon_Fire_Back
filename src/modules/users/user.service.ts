import { UsuarioRepositorio } from "./user.repository";
import { crearUsuarioDTO } from "./DTO/CrearUsuarioDTO";

export class UsuarioService {
    private usuarioRepo: UsuarioRepositorio;

    constructor() {
        this.usuarioRepo = new UsuarioRepositorio();
    }

    crearUsuario = async (data: crearUsuarioDTO) => {
        const usuario = await this.usuarioRepo.obtenerUsuarioPorNombreUsuario(data.nombre_usuario);
        if (usuario) {
            throw new Error("El usuario ya existe")
        }
        const nuevoUsuario = await this.usuarioRepo.crearUsuario(data);
        return nuevoUsuario;
    }
} 