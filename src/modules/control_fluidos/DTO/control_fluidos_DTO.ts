export interface GuardarControlFluidosDTO {
    camionId: string;
    usuarioId: string;
    aceite_motor: 'OK' | 'BAJO' | 'CRITICO';
    liquido_refrigerante: 'OK' | 'BAJO' | 'CRITICO';
    liquido_frenos: 'OK' | 'BAJO' | 'CRITICO';
    liquido_direccion: 'OK' | 'BAJO' | 'CRITICO';
    observaciones?: string;
}
