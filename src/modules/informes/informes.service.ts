import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { InformesRepositorio } from "./informes.repository";
import { ActualizarBorradorDTO } from "./DTO/informes_dto";
import { formatToARTString } from "../../lib/utils";

export class InformesService {
    private repo: InformesRepositorio;

    constructor() {
        this.repo = new InformesRepositorio();
    }

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

    obtenerDatosInforme = async (alertaId: string) => {
        const alerta = await this.repo.obtenerDatosParaInforme(alertaId);
        if (!alerta) throw new Error('Alerta no encontrada');
        return alerta;
    }

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
}
