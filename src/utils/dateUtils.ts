import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDateForDisplay = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return 'Fecha no disponible';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        // Ej: "12 Feb, 2024"
        return format(date, "d MMM, yyyy", { locale: es });
    } catch (error) {
        return 'Error en fecha';
    }
};

export const formatTimeForDisplay = (timeString: string | null | undefined): string => {
    if (!timeString) return '--:--';
    return timeString; // Normalmente ya viene como HH:mm
};

export const getDayNumber = (dateString: string | Date): string => {
    try {
        return format(new Date(dateString), 'd');
    } catch { return '--'; }
};

export const getMonthName = (dateString: string | Date): string => {
    try {
        return format(new Date(dateString), 'MMM', { locale: es }).toUpperCase();
    } catch { return '---'; }
}
