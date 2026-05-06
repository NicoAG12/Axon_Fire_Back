import { UsuarioRepositorio } from "../users/user.repository";
import { loginDTO, tokenDTO } from "../users/DTO/login_dto";
import bcrypt from "bcrypt"
import jsonwebtoken from 'jsonwebtoken'
export class AuthService {
    private usuarioRepo: UsuarioRepositorio;
    private jwt: any;
    constructor() {
        this.usuarioRepo = new UsuarioRepositorio();
        this.jwt = jsonwebtoken
    }

    login = async (data: loginDTO) => {
        const usuario = await this.usuarioRepo.obtenerUsuarioPorNombreUsuario(data.nombre_usuario);

        if (!usuario) {
            throw new Error("No se encuentra un usuario relacionado")
        }

        if (!usuario.password) {
            throw new Error("El usuario no tiene contraseña configurada")
        }

        const esCorrecto = await bcrypt.compare(data.password, usuario.password);
        if (!esCorrecto) {
            throw new Error("La contraseña es incorrecta")
        }
        return usuario;
    }
    generarToken = async (usuario: tokenDTO) => {

        const payload = {
            id_usuario: usuario.id_usuario,
            rol: usuario.rol
        }

        return this.jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

    }
} 