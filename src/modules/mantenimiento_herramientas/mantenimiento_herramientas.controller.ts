import { Response } from 'express';
import { AuthRequest } from "../../middlewares/auth.middleware";
import { MantenimientoHerramientasService } from './mantenimiento_herramientas.service';
import { GuardarMantenimientoHerramientaDTO } from './DTO/mantenimiento_herramientas_DTO';

const NIVELES_ACEITE = ['OK', 'BAJO', 'CRITICO'];
const ESTADOS_MANGUERAS = ['OK', 'DANADO'];
const PRESIONES = ['OK', 'DESVIACION'];
const ESTADOS_LIMPIEZA = ['OK', 'REQUIERE_LIMPIEZA'];

export class MantenimientoHerramientasController {
    private service = new MantenimientoHerramientasService();

    guardarMantenimiento = async (req: AuthRequest, res: Response) => {
        try {
            const usuarioId = (req.user as any).id_usuario;
            if (!usuarioId) {
                return res.status(401).json({ error: 'Usuario no autenticado en el token' });
            }

            const { herramientaId, nivel_aceite, estado_mangueras, presion_trabajo, estado_limpieza, observaciones } = req.body;

            if (!herramientaId) {
                return res.status(400).json({ error: 'herramientaId es requerido' });
            }
            if (!nivel_aceite || !estado_mangueras || !presion_trabajo || !estado_limpieza) {
                return res.status(400).json({ error: 'Todos los campos son requeridos: nivel_aceite, estado_mangueras, presion_trabajo, estado_limpieza' });
            }
            if (!NIVELES_ACEITE.includes(nivel_aceite)) {
                return res.status(400).json({ error: 'nivel_aceite debe ser OK, BAJO o CRITICO' });
            }
            if (!ESTADOS_MANGUERAS.includes(estado_mangueras)) {
                return res.status(400).json({ error: 'estado_mangueras debe ser OK o DANADO' });
            }
            if (!PRESIONES.includes(presion_trabajo)) {
                return res.status(400).json({ error: 'presion_trabajo debe ser OK o DESVIACION' });
            }
            if (!ESTADOS_LIMPIEZA.includes(estado_limpieza)) {
                return res.status(400).json({ error: 'estado_limpieza debe ser OK o REQUIERE_LIMPIEZA' });
            }

            const data: GuardarMantenimientoHerramientaDTO = {
                herramientaId,
                usuarioId,
                nivel_aceite,
                estado_mangueras,
                presion_trabajo,
                estado_limpieza,
                observaciones
            };

            const resultado = await this.service.guardarMantenimiento(data);
            return res.status(201).json(resultado);
        } catch (error: any) {
            console.error('Error al guardar mantenimiento:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    obtenerHistorial = async (req: AuthRequest, res: Response) => {
        try {
            const herramientaId = req.params.herramientaId as string;
            if (!herramientaId) {
                return res.status(400).json({ error: 'herramientaId es requerido' });
            }
            const resultado = await this.service.obtenerHistorialPorHerramienta(herramientaId);
            return res.status(200).json(resultado);
        } catch (error: any) {
            console.error('Error al obtener historial de mantenimiento:', error);
            return res.status(500).json({ error: error.message });
        }
    };
}
