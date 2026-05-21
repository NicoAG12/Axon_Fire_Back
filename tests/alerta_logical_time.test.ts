import { AlertaService } from '../src/modules/alerta/alerta.service';
import { AlertaRepositorio } from '../src/modules/alerta/alerta.repository';

// Mockear el repositorio para aislar las pruebas de la base de datos y esquemas de Prisma
jest.mock('../src/modules/alerta/alerta.repository');

describe('AX-14: Test Unitario - Error Lógico de Tiempos en Alerta', () => {
  let alertaService: AlertaService;
  let mockAlertaRepo: jest.Mocked<AlertaRepositorio>;

  beforeEach(() => {
    // Resetear mocks e inyectar el repositorio mockeado al servicio
    jest.clearAllMocks();
    alertaService = new AlertaService();
    mockAlertaRepo = (alertaService as any).alertaRepo;
  });

  it('ROJO - Debería calcular una duración negativa cuando la hora de regreso (ahora) es menor que la hora de llamado (futuro), demostrando el error lógico de tiempos', async () => {
    const mockAlertaId = 'test-alerta-id';
    
    // 1. Simular que la alerta fue creada en el futuro (hora de llamado: dentro de 2 horas)
    const horaLlamadoFuturo = new Date();
    horaLlamadoFuturo.setHours(horaLlamadoFuturo.getHours() + 2);

    mockAlertaRepo.buscarEstadoPorNombre.mockResolvedValue({ id: '3', nombre_estado: 'FINALIZADO' });
    mockAlertaRepo.buscarAlertaPorID.mockResolvedValue({
      id: mockAlertaId,
      sub_categoria_alerta_id: '1',
      ubicacion: 'Calle Falsa 123',
      observaciones: 'Prueba de tiempo lógico AX-14',
      fecha_hora: horaLlamadoFuturo, // Llamado en el futuro
      estado_alerta_id: '1',
      usuario_alta_alerta: 'abc1'
    } as any);

    mockAlertaRepo.actualizarEstadoAlerta.mockImplementation(async (id, estadoId, fechaFin, duracion) => {
      return { id, estado_alerta_id: estadoId, fecha_hora_finalizacion: fechaFin, duracion } as any;
    });

    // 2. Ejecutar la finalización del servicio
    const result = await alertaService.finalizarAlerta(mockAlertaId);

    expect(result).toBeDefined();
    
    // 3. Verificar que se haya invocado la actualización del repositorio
    expect(mockAlertaRepo.actualizarEstadoAlerta).toHaveBeenCalledTimes(1);

    // Extraer los argumentos pasados al repositorio para la actualización
    const [idPassed, estadoIdPassed, fechaFinPassed, duracionCalculada] = mockAlertaRepo.actualizarEstadoAlerta.mock.calls[0];

    expect(idPassed).toBe(mockAlertaId);
    expect(estadoIdPassed).toBe('3');
    expect(fechaFinPassed).toBeDefined();

    // Comprobar que la duración calculada es negativa (Error lógico de negocio)
    expect(duracionCalculada).toBeLessThan(0);

    console.warn(`[ERROR LÓGICO DOCUMENTADO AX-14]: Se calculó una duración negativa de ${duracionCalculada} ms para la alerta al finalizar antes de iniciar.`);
  });
});
