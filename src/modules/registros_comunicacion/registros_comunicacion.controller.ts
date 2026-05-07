import { Request, Response } from 'express';
import { RegistrosComunicacionService } from './registros_comunicacion.service';
import { crearRegistroComunicacionDTO } from './DTO/registros_comunicacion_DTO';

export class RegistrosComunicacionController {
    private service: RegistrosComunicacionService;

    constructor() {
        this.service = new RegistrosComunicacionService();
    }

    crearRegistro = async (req: Request, res: Response) => {
        try {
            const data: crearRegistroComunicacionDTO = req.body;
            const registro = await this.service.crearRegistro(data);
            return res.status(201).json(registro);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    obtenerRegistrosPorAlerta = async (req: Request<{ id_alerta: string }>, res: Response) => {
        try {
            const { id_alerta } = req.params;
            const registros = await this.service.obtenerRegistros(id_alerta);
            return res.json(registros);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

}