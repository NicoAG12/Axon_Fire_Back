import { NotificacionesRepositorio } from "./notificaciones.repository";
import { registrarTokenDTO } from "./DTO/notificaciones_DTO";

export class NotificacionesService {
    private repositorio = new NotificacionesRepositorio();

    async registrarToken(data: registrarTokenDTO) {
        return await this.repositorio.guardarToken(data);
    }

    async enviarPushCheckListSemanal(usuariosIds: string[], payload: any) {
        const tokens = await this.repositorio.obtenerTokensPorUsuarios(usuariosIds);

        if (!tokens || tokens.length === 0) {
            console.warn('⚠️ [ChecklistSemanal] No se encontraron tokens para los usuarios:', usuariosIds);
            return null;
        }

        console.log(`📲 [ChecklistSemanal] Enviando push a ${tokens.length} dispositivo(s)`);

        // === DEBUG: Verificar EXPO_ACCESS_TOKEN ===
        const expoToken = process.env.EXPO_ACCESS_TOKEN;
        console.log('🔑 [DEBUG] EXPO_ACCESS_TOKEN definido:', !!expoToken);
        console.log('🔑 [DEBUG] EXPO_ACCESS_TOKEN length:', expoToken?.length);
        console.log('🔑 [DEBUG] EXPO_ACCESS_TOKEN primeros 20 chars:', expoToken?.substring(0, 20));
        console.log('🔑 [DEBUG] EXPO_ACCESS_TOKEN tiene espacios al inicio/fin:', expoToken !== expoToken?.trim());
        // === FIN DEBUG ===

        const messages = tokens.map(token => ({
            to: token,
            title: payload.title || 'CONTROL SEMANAL',
            body: payload.body || 'COMPLETE EL CONTROL SEMANAL DEL CUARTEL',
            data: { id: payload.id }
        }))

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate',
            };

            const expoAccessToken = process.env.EXPO_ACCESS_TOKEN?.trim();
            if (expoAccessToken) {
                headers['Authorization'] = `Bearer ${expoAccessToken}`;
            }

            let response = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers,
                body: JSON.stringify(messages)
            });

            let data = await response.json();

            // Si falla por autenticación, reintentar SIN el header Authorization
            if (data.errors?.some((e: any) => e.code === 'AUTHENTICATION_ERROR')) {
                console.warn('⚠️ [ChecklistSemanal] Token inválido, reintentando sin Authorization...');
                delete headers['Authorization'];
                response = await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(messages)
                });
                data = await response.json();
            }

            console.log('📲 [ChecklistSemanal] Respuesta Expo Push:', JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('❌ [ChecklistSemanal] Error enviando push notification:', error);
            return null;
        }
    }

    async enviarPush(usuariosIds: string[], payload: any) {
        const tokens = await this.repositorio.obtenerTokensPorUsuarios(usuariosIds);
        if (payload.sub_categoria_alerta_id == '1') {
            payload.sub_categoria_alerta_id = 'INCENDIO ESTRUCTURAL'
        } else if (payload.sub_categoria_alerta_id == '2') {
            payload.sub_categoria_alerta_id = 'RESCATE AUTOMOVIL'
        }

        if (!tokens || tokens.length === 0) {
            console.warn('⚠️ [Alerta] No se encontraron tokens para los usuarios:', usuariosIds);
            return null;
        }

        console.log(`📲 [Alerta] Enviando push a ${tokens.length} dispositivo(s)`);

        // === DEBUG: Verificar EXPO_ACCESS_TOKEN ===
        const expoToken = process.env.EXPO_ACCESS_TOKEN;
        console.log('🔑 [DEBUG] EXPO_ACCESS_TOKEN definido:', !!expoToken);
        console.log('🔑 [DEBUG] EXPO_ACCESS_TOKEN length:', expoToken?.length);
        console.log('🔑 [DEBUG] EXPO_ACCESS_TOKEN primeros 20 chars:', expoToken?.substring(0, 20));
        console.log('🔑 [DEBUG] EXPO_ACCESS_TOKEN tiene espacios al inicio/fin:', expoToken !== expoToken?.trim());
        // === FIN DEBUG ===

        const messages = tokens.map(token => ({
            to: token,
            title: payload.title || payload.sub_categoria_alerta_id,
            body: payload.body || `Ubicación: ${payload.ubicacion}`,
            sound: (payload.silent ? null : 'default') as any,
            priority: (payload.silent ? 'normal' : 'high') as any,
            channelId: payload.silent ? 'default' : 'emergency',
            data: { alertaId: payload.id, silent: !!payload.silent }
        }));

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate',
            };

            const expoAccessToken = process.env.EXPO_ACCESS_TOKEN?.trim();
            if (expoAccessToken) {
                headers['Authorization'] = `Bearer ${expoAccessToken}`;
            }

            let response = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers,
                body: JSON.stringify(messages)
            });

            let data = await response.json();

            // Si falla por autenticación, reintentar SIN el header Authorization
            if (data.errors?.some((e: any) => e.code === 'AUTHENTICATION_ERROR')) {
                console.warn('⚠️ [Alerta] Token inválido, reintentando sin Authorization...');
                delete headers['Authorization'];
                response = await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(messages)
                });
                data = await response.json();
            }

            console.log('📲 [Alerta] Respuesta Expo Push:', JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('❌ [Alerta] Error enviando push notification:', error);
            return null;
        }
    }
}