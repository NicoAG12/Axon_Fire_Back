export function getLocalDate(): Date {
    const now = new Date();
    const utcMs = now.getTime();
    const artOffset = -3 * 60 * 60 * 1000;
    return new Date(utcMs + artOffset);
}