import { prisma } from "../../lib/prisma"
import { crearUsuarioDTO } from "./DTO/CrearUsuarioDTO"
import { randomUUID } from "crypto"
import bcrypt from "bcrypt"

export class UsuarioRepositorio {

  async crearUsuario(data: crearUsuarioDTO) {

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    return await prisma.usuarios.create({
      data: {
        id: randomUUID(), // Inyectado manualmente para Typescript en cliente desactualizado
        nombre_usuario: data.nombre_usuario,
        password: passwordHash,
        rol: data.rol,
        bombero: data.bombero ? {
          create: {
            id: randomUUID(), // Inyectado manualmente temporalmente para Typescript
            nombre: data.bombero.nombre,
            apellido: data.bombero.apellido,
            rango: data.bombero.rango,
          }
        } : undefined
      }
    })
  }

  async obtenerUsuarioPorNombreUsuario(nombre_usuario: string) {
    return await prisma.usuarios.findUnique({
      where: {
        nombre_usuario
      }
    })
  }

}