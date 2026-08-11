import { prisma } from "../../lib/prisma"
import { crearUsuarioDTO } from "./DTO/crear_usuario_dto"
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
      },
      include: {
        bombero: true
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

  async obtenerBomberos() {
    return await prisma.bomberos.findMany({
      include: {
        usuarioId: {
          select: {
            id: true,
            nombre_usuario: true,
            rol: true,
            activo: true
          }
        },
        rangoBombero: true
      }
    });
  }

  async toggleActivo(id: string) {
    const usuario = await prisma.usuarios.findUnique({
      where: { id },
      select: { activo: true, rol: true }
    });

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    if (usuario.rol === 'ADMIN') {
      throw new Error("No se puede desactivar a un administrador");
    }

    return prisma.usuarios.update({
      where: { id },
      data: { activo: !usuario.activo },
      select: { id: true, activo: true }
    });
  }

}