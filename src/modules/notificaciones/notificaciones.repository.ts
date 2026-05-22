import { prisma } from "../../lib/prisma";
import { registrarTokenDTO } from "./DTO/notificaciones_DTO";

export class NotificacionesRepositorio {
    async guardarToken(data: registrarTokenDTO) {
        console.log(`[NotificacionesRepositorio.guardarToken] Intentando upsert. Token (truncado): ${data.token?.substring(0, 20)}..., usuario_id: ${data.usuario_id}`);

        const resultado = await prisma.tokens_dispositivos.upsert({
            where: { token: data.token },
            update: { usuario_id: data.usuario_id, plataforma: data.plataforma },
            create: {
                usuario_id: data.usuario_id,
                token: data.token,
                plataforma: data.plataforma
            }
        });

        console.log(`[NotificacionesRepositorio.guardarToken] Upsert exitoso. token_id: ${resultado.id}, usuario_id: ${resultado.usuario_id}, fecha_alta: ${resultado.fecha_alta}`);

        return resultado;
    }

    async obtenerTokensPorUsuarios(usuariosIds: string[]) {
        const tokens = await prisma.tokens_dispositivos.findMany({
            where: { usuario_id: { in: usuariosIds } },
            select: { token: true }
        });

        return tokens.map(t => t.token);
    }

    async obtenerTokensPorUsuarioId(usuarioId: string) {
        console.log(`[NotificacionesRepositorio.obtenerTokensPorUsuarioId] Buscando tokens para usuario: ${usuarioId}`);

        const tokens = await prisma.tokens_dispositivos.findMany({
            where: { usuario_id: usuarioId },
            select: {
                id: true,
                token: true,
                plataforma: true,
                fecha_alta: true
            }
        });

        console.log(`[NotificacionesRepositorio.obtenerTokensPorUsuarioId] ${tokens.length} token(s) encontrados para usuario ${usuarioId}`);
        return tokens;
    }
}
