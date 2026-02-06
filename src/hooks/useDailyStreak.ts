import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../components/context/AuthContext';
import { useToast } from '../components/context/ToastContext';

/**
 * Hook para registrar el login diario y gestionar la racha
 * Se ejecuta automáticamente al montar la app
 */
export const useDailyStreak = () => {
    const { user } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        if (!user) return;

        const recordLogin = async () => {
            try {
                const { data, error } = await (supabase.rpc as any)('record_daily_login');

                if (error) {
                    console.error('Error recording daily login:', error);
                    return;
                }

                // Si ganó puntos, mostrar notificación
                if (data && data.points > 0) {
                    showToast(`${data.message}: +${data.points} puntos`, 'success');
                }
            } catch (err) {
                console.error('Failed to record daily login:', err);
            }
        };

        // Ejecutar al montar
        recordLogin();
    }, [user, showToast]);
};
