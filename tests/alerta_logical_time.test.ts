import { AlertaService } from '../src/modules/alerta/alerta.service';
import { AlertaRepositorio } from '../src/modules/alerta/alerta.repository';

// Mock del repositorio para aislar las pruebas de DB y esquemas de Prisma
jest.mock('../src/modules/alerta/alerta.repository');

describe('AX-14: Test Unitario - Error Lógico de Tiempos en Alerta', () => {
  let alertaService: AlertaService;
  let mockAlertaRepo: jest.Mocked<AlertaRepositorio>;

  beforeEach(() => {
    jest.clearAllMocks();
    alertaService = new AlertaService();
    mockAlertaRepo = (alertaService as any).alertaRepo;
  });

  it('ROJO - Debería calcular una duración negativa cuando la hora de regreso (ahora) es menor que la hora de llamado (futuro), demostrando el error lógico de tiempos', async () => {
    const mockAlertaId = 'test-alerta-id';

    // Simular alerta creada en el futuro (hora de llamado: dentro de 2 horas)
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

    const result = await alertaService.finalizarAlerta(mockAlertaId);

    expect(result).toBeDefined();

    expect(mockAlertaRepo.actualizarEstadoAlerta).toHaveBeenCalledTimes(1);

    const [idPassed, estadoIdPassed, fechaFinPassed, duracionCalculada] = mockAlertaRepo.actualizarEstadoAlerta.mock.calls[0];

    expect(idPassed).toBe(mockAlertaId);
    expect(estadoIdPassed).toBe('3');
    expect(fechaFinPassed).toBeDefined();

    // Duración negativa = error lógico (finalizar antes de iniciar)
    expect(duracionCalculada).toBeLessThan(0);
  });
});
