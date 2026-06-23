import { expect } from 'chai'
import sinon from 'sinon'
import { AlertaService } from '../../../../src/modules/alerta/alerta.service'


describe('AlertaService-crearAlertaYNotificar', () => {
    let service: AlertaService

    beforeEach(() => {
        service = new AlertaService()
    })

    afterEach(() => {
        sinon.restore()
    })

    it('Debe crear alerta PENDIENTE y notificar a todos los bomberos (sin destinatariosIds)', async () => {
        const repo = (service as any).alertaRepo

        const alertaMock = {
            sub_categoria_alerta_id: '3',
            ubicacion: 'CAMPUS UNSTA',
            latitud: -26.80061144976787,
            longitud: -65.29865743182415,
            observaciones: 'REQUIEREN AGUA',
            prioridad: 'ALTA' as const,
            usuario_alta_alerta: 'abc1'

        }

        const alertaCreadaMock = {
            id: 'UUIDGENERADO',
            sub_categoria_alerta_id: '3',
            ubicacion: 'CAMPUS UNSTA',
            latitud: '-26.80061144976787',
            longitud: '-65.29865743182415',
            observaciones: 'REQUIEREN AGUA',
            fecha_hora: new Date('2026-05-31T17:00:00.000Z'),
            estado_alerta_id: '1',
            prioridad: 'ALTA',
            usuario_alta_alerta: 'abc1'
        }

        const idsNotificar = ['bombero_test_1', 'bombero_test_2']

        const estadoInicial = {
            id: '1',
            nombre_estado: 'PENDIENTE'
        }

        sinon.stub(repo, 'buscarTodosLosBomberosIds').resolves(idsNotificar)
        sinon.stub(repo, 'buscarEstadoPorNombre').resolves(estadoInicial)
        const spyCrearAlertaCompletaTx = sinon
            .stub(repo, 'crearAlertaCompletaTx')
            .resolves(alertaCreadaMock)

        const notiInterno = (service as any).notiService

        const spyEnviarPush = sinon
            .stub(notiInterno, 'enviarPush')
            .resolves(undefined)

        const resultado = await service.crearAlertaYNotificar(alertaMock as any)

        expect(spyEnviarPush.calledOnce).to.be.true
        expect(spyCrearAlertaCompletaTx.calledOnce).to.be.true
        expect(spyCrearAlertaCompletaTx.calledWith(
            alertaMock,
            idsNotificar,
            estadoInicial.id
        )).to.be.true

        expect(resultado).to.deep.equal(alertaCreadaMock)
        expect(resultado.id).to.equal('UUIDGENERADO')
        expect(resultado.estado_alerta_id).to.equal('1')
    })

    it('Debe usar subcategoria por defecto (3) si no se envía', async () => {
        const repo = (service as any).alertaRepo

        const alertaSinSubcategoria = {
            ubicacion: 'CAMPUS UNSTA',
            latitud: -26.8,
            longitud: -65.2,
            observaciones: 'TEST',
            prioridad: 'BAJA' as const,
            usuario_alta_alerta: 'abc1',
            destinatariosIds: ['bombero_1']
        }

        const alertaEsperada = {
            id: 'uuid-2',
            sub_categoria_alerta_id: '3',
            ubicacion: 'CAMPUS UNSTA',
            observaciones: 'TEST',
            fecha_hora: new Date(),
            estado_alerta_id: '1',
            prioridad: 'BAJA',
            usuario_alta_alerta: 'abc1'
        }

        sinon.stub(repo, 'buscarEstadoPorNombre').resolves({
            id: '1',
            nombre_estado: 'PENDIENTE'
        })
        const spyCrearAlertaCompletaTx = sinon
            .stub(repo, 'crearAlertaCompletaTx')
            .resolves(alertaEsperada)

        const notiInterno = (service as any).notiService
        sinon.stub(notiInterno, 'enviarPush').resolves(undefined)

        const resultado = await service.crearAlertaYNotificar(alertaSinSubcategoria as any)

        const dataEnviada = spyCrearAlertaCompletaTx.firstCall.args[0]
        expect(dataEnviada.sub_categoria_alerta_id).to.equal('3')
        expect(resultado.sub_categoria_alerta_id).to.equal('3')
    })

    it('Debe lanzar error si el estado PENDIENTE no existe en DB', async () => {
        const repo = (service as any).alertaRepo

        sinon.stub(repo, 'buscarEstadoPorNombre').resolves(null)

        try {
            await service.crearAlertaYNotificar({
                sub_categoria_alerta_id: '1',
                ubicacion: 'TEST',
                latitud: -26.8,
                longitud: -65.2,
                observaciones: 'TEST',
                prioridad: 'ALTA',
                usuario_alta_alerta: 'abc1',
                destinatariosIds: ['bombero_1']
            })
            expect.fail('Debió lanzar error')
        } catch (error: any) {
            expect(error.message).to.equal('Estado inicial no configurado en DB')
        }
    })
})




describe('AlertaService-FinalizarAlerta()', () => {

    let service: AlertaService

    beforeEach(() => {
        service = new AlertaService()
    })
    afterEach(() => {
        sinon.restore()
    })

    it('Alerta encontrada y finalizada', async () => {
        const repo = (service as any).alertaRepo;
        const fechaInicio = new Date('2026-05-31T13:08:21.000Z')
        const fechaFin = new Date('2026-05-31T17:00:00.000Z')
        const duracionEsperada = fechaFin.getTime() - fechaInicio.getTime()

        const alertaMock = {
            id: 'alert-456',
            fecha_hora: fechaInicio,
            estado_alerta_id: 'est-1',
            ubicacion: 'Av. San Martín 1250, Godoy Cruz'
        }

        const alertaActualizadaMock = {
            id: 'alert-456',
            fecha_hora: fechaInicio,
            estado_alerta_id: 'est-3',
            fecha_hora_finalizacion: fechaFin,
            ubicacion: 'Av. San Martín 1250, Godoy Cruz',
            duracion_total_alerta: duracionEsperada
        }


        sinon.stub(repo, 'buscarEstadoPorNombre').resolves({
            id: 'est-3',
            nombre_estado: 'FINALIZADO'
        })

        sinon.stub(repo, 'buscarAlertaPorID').resolves(alertaMock)

        const clock = sinon.useFakeTimers(new Date('2026-05-31T20:00:00.000Z'))

        const spyActualizar = sinon.stub(repo, 'actualizarEstadoAlerta').resolves(alertaActualizadaMock)

        const resultado = await service.finalizarAlerta('alert-456')


        expect(spyActualizar.calledOnce).to.be.true
        expect(spyActualizar.calledWith(
            'alert-456',
            'est-3',
            fechaFin,
            duracionEsperada
        )).to.be.true

        expect(resultado.fecha_hora).to.equal('2026-05-31 13:08:21')
        expect(resultado.fecha_hora_finalizacion).to.equal('2026-05-31 17:00:00')
        expect(resultado.estado_alerta_id).to.equal('est-3')
        expect(resultado.duracion_total_alerta).to.equal(duracionEsperada)

        clock.restore()
    })

    it('Lanzar error si el estado no esta configurado en la DB', async () => {
        const repo = (service as any).alertaRepo;
        sinon.stub(repo, 'buscarEstadoPorNombre').resolves(null);
        try {
            await service.finalizarAlerta('alerta-123');
            expect.fail('Debio lanzar error')
        } catch (error: any) {
            expect(error.message).to.equal('Estado FINALIZADO no configurado en DB')
        }
    })

    it('Lanzar error si la alerta no se encuentra', async () => {
        const repo = (service as any).alertaRepo;
        sinon.stub(repo, 'buscarAlertaPorID').resolves(null);
        sinon.stub(repo, 'buscarEstadoPorNombre').resolves({ id: 'est-3', nombre_estado: 'FINALIZADO' })
        try {
            await service.finalizarAlerta('alerta-123')
            expect.fail('Debio lanzar error')
        } catch (error: any) {
            expect(error.message).to.equal('No se encuentra la alerta')
        }
    })
})