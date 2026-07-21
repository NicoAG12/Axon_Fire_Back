import { Response } from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';
import { InformesRepositorio } from "./informes.repository";
import { ActualizarBorradorDTO } from "./DTO/informes_dto";
import { formatToARTString } from "../../lib/utils";
import { AlertaRepositorio } from '../alerta/alerta.repository';

export class InformesService {
    private repo: InformesRepositorio;
    private alertaRepo: AlertaRepositorio

    constructor() {
        this.repo = new InformesRepositorio();
        this.alertaRepo = new AlertaRepositorio()
    }

    guardarInforme = async (alertaId: string, data: ActualizarBorradorDTO, userId: string) => {
        const alerta = await this.alertaRepo.buscarAlertaPorID(alertaId)
        if (!alerta) return { success: false, message: 'Alerta no existente' }

        if (alerta.estadoAlerta.nombre_estado != 'FINALIZADO') return { success: false, message: 'Alerta no finalizada' }

        const resultado = await this.repo.actualizarInforme(alertaId, data, userId);
        if (resultado) return { success: true, message: 'Informe guardado exitosamente' }
        return { success: false, message: 'Error al guardar informe' }
    }

    generarPDF = async (alertaId: string, res: Response) => {
        const informe = await this.repo.obtenerDatosParaInforme(alertaId);
        if (!informe) throw new Error('Informe no encontrado');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition',
            `attachment; filename="informe_emergencia_${alertaId.substring(0, 8)}.pdf"`);
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 120, bottom: 50, left: 50, right: 50 },
            info: {
                Title: 'Informe de Emergencia',
                Author: 'Axion Fire - Sistema de Gestión',
            }
        });

        doc.pipe(res);

        const addHeader = () => {
            const originalY = doc.y;
            const originalX = doc.x;

            // 1. Center image (dibujada antes para quedar como fondo)
            const centerImageWidth = 250;
            const centerX = (doc.page.width / 2) - (centerImageWidth / 2);
            doc.image(path.join(process.cwd(), 'utils', 'prueba_2.png'), centerX, 15, { width: centerImageWidth });

            // 2. Left image
            doc.image(path.join(process.cwd(), 'utils', 'prueba.png'), 50, 25, { width: 60 });

            // 3. Leyenda superior (texto un poco más grande)
            doc.fontSize(9).font('Helvetica-Bold');
            doc.text('ASOCIACIÓN CUERPO DE RESCATE Y BOMBEROS VOLUNTARIOS DE YERBA BUENA', 0, 28, { align: 'center', width: doc.page.width });
            doc.fontSize(8).font('Helvetica');
            doc.text('DOMICILIO: PERU ESQ J.I. THAMES – TELEFONO: 0381-4252670', 0, 42, { align: 'center', width: doc.page.width });
            doc.text('RESOLUCION: D.P.J. 228/08', 0, 54, { align: 'center', width: doc.page.width });

            // Separator line for header
            doc.moveTo(50, 115).lineTo(545, 115).stroke();

            // Restaurar coordenadas para que el contenido de la página no empiece pegado al borde izquierdo
            doc.y = originalY;
            doc.x = 50;
        };

        doc.on('pageAdded', addHeader);
        addHeader();

        // Fecha a la derecha
        const fechaActual = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
        doc.fontSize(10).font('Helvetica')
            .text(`Ciudad de Yerba Buena, ${fechaActual}`, { align: 'right' });
        doc.moveDown(2);

        // Title
        doc.fontSize(20).font('Helvetica-Bold')
            .text('Constancia de intervencion', { align: 'center' });
        doc.moveDown(2);

        // Informe details
        if (informe.observaciones_admin) {
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica').text(informe.observaciones_admin, { align: 'justify' });
            doc.moveDown(1);
        }


        doc.end();
    }

    /* 
    --Se comento por logica vieja. Se arma de nuevo el metodo
    generarPDF = async (alertaId: string, res: Response) => {
        // 1. Obtener todos los datos
        const alerta = await this.repo.obtenerDatosParaInforme(alertaId);

        if (!alerta) throw new Error('Alerta no encontrada');

        // 2. Validar precondición: debe estar FINALIZADA
        if (alerta.estadoAlerta.nombre_estado !== 'FINALIZADO') {
            throw new Error('Solo se pueden generar informes de emergencias finalizadas');
        }

        const borrador = alerta.informe;

        // 3. Setear headers HTTP ANTES de pipear
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition',
            `attachment; filename="informe_emergencia_${alertaId.substring(0, 8)}.pdf"`);

        // 4. Crear documento PDF
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            info: {
                Title: 'Informe de Emergencia',
                Author: 'Axion Fire - Sistema de Gestión',
            }
        });

        doc.pipe(res);

        // ── Encabezado ──────────────────────────────────────────
        doc.fontSize(20).font('Helvetica-Bold')
            .text('INFORME DE EMERGENCIA', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica')
            .text('Documento generado por el Sistema Axion Fire', { align: 'center' });
        doc.moveDown(0.5);

        // Línea separadora
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1);

        // ── Datos generales ─────────────────────────────────────
        doc.fontSize(14).font('Helvetica-Bold').text('Datos de la Emergencia');
        doc.moveDown(0.5);

        const datosGenerales = [
            ['Tipo de siniestro', alerta.subCategoriaAlerta.nombre_sub_categoria],
            ['Categoría', alerta.subCategoriaAlerta.categoriaAlerta.nombre_categoria],
            ['Ubicación', alerta.ubicacion],
            ['Fecha/hora inicio', formatToARTString(alerta.fecha_hora) || 'N/A'],
            ['Fecha/hora finalización', formatToARTString(alerta.fecha_hora_finalizacion) || 'N/A'],
            ['Duración total', `${((alerta.duracion_total_alerta || 0) / 3_600_000).toFixed(1)} horas`],
        ];

        doc.fontSize(11).font('Helvetica');
        for (const [label, valor] of datosGenerales) {
            doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
            doc.font('Helvetica').text(valor as string);
        }

        doc.moveDown(1);

        // ── Personal asistente ──────────────────────────────────
        doc.fontSize(14).font('Helvetica-Bold').text('Personal Asistente');
        doc.moveDown(0.5);

        if (alerta.respuestas.length === 0) {
            doc.fontSize(11).font('Helvetica').text('No se registraron asistencias confirmadas.');
        } else {
            // Encabezado de tabla
            const tableTop = doc.y;
            const col1 = 50;
            const col2 = 80;
            const col3 = 280;
            const col4 = 420;

            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('#', col1, tableTop);
            doc.text('Nombre', col2, tableTop);
            doc.text('Apellido', col3, tableTop);
            doc.text('Rango', col4, tableTop);
            doc.moveDown(0.3);

            // Línea bajo encabezado
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.3);

            doc.fontSize(10).font('Helvetica');
            alerta.respuestas.forEach((r: any, i: number) => {
                const bombero = r.usuarioId.bombero;
                const y = doc.y;
                doc.text(`${i + 1}`, col1, y);
                doc.text(bombero?.nombre || 'N/A', col2, y);
                doc.text(bombero?.apellido || 'N/A', col3, y);
                doc.text(bombero?.rangoBombero?.nombre_rol || 'N/A', col4, y);
                doc.moveDown(0.2);
            });

            // Restablecer el cursor X al margen izquierdo después de la tabla
            doc.x = 50;
        }

        doc.moveDown(1);

        // ── Observaciones de la emergencia ───────────────────────
        doc.fontSize(14).font('Helvetica-Bold').text('Observaciones de la Emergencia');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica')
            .text(alerta.observaciones || 'Sin observaciones registradas.', { align: 'justify' });

        doc.moveDown(1);

        // ── Observaciones del Administrador (borrador) ──────────
        if (borrador?.observaciones_admin) {
            doc.fontSize(14).font('Helvetica-Bold').text('Observaciones del Administrador');
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica').text(borrador.observaciones_admin, { align: 'justify' });
            doc.moveDown(1);
        }

        // ── Detalles de la propiedad afectada ───────────────────
        if (borrador?.detalles_propiedad) {
            doc.fontSize(14).font('Helvetica-Bold').text('Detalles de la Propiedad Afectada');
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica').text(borrador.detalles_propiedad, { align: 'justify' });
            doc.moveDown(1);
        }

        // ── Pie de página ───────────────────────────────────────
        doc.moveDown(2);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(8).font('Helvetica')
            .text(`Documento generado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}`, { align: 'center' });
        doc.text('Este documento es válido para presentación ante aseguradoras y organismos de desarrollo social.', { align: 'center' });

        // 5. Cerrar el documento (obligatorio)
        doc.end();
    }
        */

    obtenerDatosInforme = async (alertaId: string) => {
        const alerta = await this.repo.obtenerDatosParaInforme(alertaId);
        if (!alerta) throw new Error('Alerta no encontrada');
        return alerta;
    }
    /*

    --SE COMENTA POR LOGICA VIEJA.
        obtenerOCrearBorrador = async (alertaId: string, usuarioId: string) => {
            // Verificar que la alerta existe
            const alerta = await this.repo.obtenerDatosParaInforme(alertaId);
            if (!alerta) throw new Error('Alerta no encontrada');
    
            if (alerta.estadoAlerta.nombre_estado !== 'FINALIZADO') {
                throw new Error('Solo se pueden crear informes de emergencias finalizadas');
            }
    
            return await this.repo.crearOObtenerBorrador(alertaId, usuarioId);
        }
    
        actualizarBorrador = async (alertaId: string, datos: ActualizarBorradorDTO) => {
            const borrador = await this.repo.obtenerBorradorPorAlerta(alertaId);
            if (!borrador) throw new Error('No existe un borrador para esta alerta. Primero obtenga el borrador con GET.');
    
            return await this.repo.actualizarBorrador(alertaId, datos);
        }
    */
}
