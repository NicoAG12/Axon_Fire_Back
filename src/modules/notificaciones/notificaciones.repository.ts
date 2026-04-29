import { prisma } from "../../lib/prisma";
import { registrarTokenDTO } from "./DTO/notificaciones_DTO";

export class NotificacionesRepositorio {
    async guardarToken(data: registrarTokenDTO) {
        return await prisma.tokens_dispositivos.upsert({
            where: { token: data.token },
            update: { usuario_id: data.usuario_id, plataforma: data.plataforma },
            create: {
                usuario_id: data.usuario_id,
                token: data.token,
                plataforma: data.plataforma
            }
        });
    }

    async obtenerTokensPorUsuarios(usuariosIds: string[]) {
        const tokens = await prisma.tokens_dispositivos.findMany({
            where: { usuario_id: { in: usuariosIds } },
            select: { token: true, usuario_id: true, fecha_alta: true },
            orderBy: { fecha_alta: 'desc' }
        });

        const tokensPorUsuario = new Map<string, string>();
        for (const t of tokens) {
            if (!tokensPorUsuario.has(t.usuario_id)) {
                tokensPorUsuario.set(t.usuario_id, t.token);
            }
        }
        
        const resultado = Array.from(tokensPorUsuario.values());
        return resultado;
    }
}