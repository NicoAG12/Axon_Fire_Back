import { user_roles } from "@prisma/client";

export interface crearUsuarioDTO {
    nombre_usuario: string,
    password: string,
    rol: user_roles
    bombero?: {
        nombre: string,
        apellido: string,
        rango: string
    }
}