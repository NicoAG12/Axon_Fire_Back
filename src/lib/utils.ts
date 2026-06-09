import { DateTime } from 'luxon';

const ART_ZONE = 'America/Argentina/Buenos_Aires';

/**
 * Obtiene la fecha/hora actual en Argentina y devuelve un Date de JS
 * cuyo reloj UTC coincide con el reloj de pared de Argentina.
 * Esto permite que PostgreSQL (timestamp without time zone) guarde
 * literalmente la hora Argentina.
 */
export function getLocalDate(): Date {
    const art = DateTime.now().setZone(ART_ZONE);
    // Creamos un Date UTC cuyo reloj de pared coincida con el de Argentina.
    // Así PostgreSQL (timestamp without time zone) guarda literalmente la hora ART.
    const utcLike = DateTime.utc(art.year, art.month, art.day, art.hour, art.minute, art.second, art.millisecond);
    return utcLike.toJSDate();
}

/**
 * Parsea un string o Date que representa hora Argentina
 * y genera un Date con el mismo reloj de pared en UTC.
 * Ej: "2026-05-22T18:53:00" -> Date con toISO "2026-05-22T18:53:00.000Z"
 */
export function parseARTDate(input: Date | string): Date {
    let isoString: string;
    if (input instanceof Date) {
        isoString = input.toISOString().replace('Z', '');
    } else {
        isoString = input;
    }

    // Parseamos como hora Argentina
    const art = DateTime.fromISO(isoString, { zone: ART_ZONE });
    if (!art.isValid) {
        throw new Error(`Fecha inválida para ART: ${input}`);
    }

    // Creamos un Date UTC con el mismo reloj de pared
    const utcLike = DateTime.utc(art.year, art.month, art.day, art.hour, art.minute, art.second, art.millisecond);
    return utcLike.toJSDate();
}

/**
 * Formatea un Date guardado como "reloj UTC = reloj ART" para devolverlo
 * al frontend sin la Z de UTC ni los milisegundos, manteniendo la hora literal.
 * Ej: Date "2026-05-22T18:53:00.123Z" -> "2026-05-22 18:53:00"
 */
export function formatToARTString(date: Date | null): string | null {
    if (!date) return null;
    const iso = date.toISOString(); 
    // Separamos por el punto de los milisegundos y reemplazamos la T por un espacio
    return iso.split('.')[0].replace('T', ' ');
}
