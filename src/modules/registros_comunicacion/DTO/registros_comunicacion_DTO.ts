import { tipos_comunicacion } from "../../../generated/client";

export interface crearRegistroComunicacionDTO {
    alerta_id: string;
    usuario_id: string;
    mensaje: string;
    tipo_comunicacion: tipos_comunicacion;
    fecha_hora: Date;
}