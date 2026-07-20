import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const parseLocalDate = (dateString: string | Date | null | undefined): Date => {
    if (!dateString) return new Date();
    if (dateString instanceof Date) return dateString;
    const cleanStr = String(dateString).trim();
    const datePart = cleanStr.split('T')[0].split(' ')[0];
    const parts = datePart.split('-').map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
        return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    }
    return new Date(dateString);
};

export const formatDateForDisplay = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return 'Fecha no disponible';
    try {
        const date = parseLocalDate(dateString);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        // Ej: "12 Feb, 2024"
        return format(date, "d 'de' MMMM, yyyy", { locale: es });
    } catch (error) {
        return 'Error en fecha';
    }
};

export const formatTimeForDisplay = (timeString: string | null | undefined): string => {
    if (!timeString) return '--:--';
    return timeString; // Normalmente ya viene como HH:mm
};

export const getDayNumber = (dateString: string | Date | null | undefined): string => {
    try {
        const date = parseLocalDate(dateString);
        if (isNaN(date.getTime())) return '--';
        return format(date, 'd');
    } catch { return '--'; }
};

export const getMonthName = (dateString: string | Date | null | undefined): string => {
    try {
        const date = parseLocalDate(dateString);
        if (isNaN(date.getTime())) return '---';
        return format(date, 'MMM', { locale: es }).toUpperCase();
    } catch { return '---'; }
};
