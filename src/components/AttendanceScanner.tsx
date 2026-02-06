import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../../lib/supabase';
import { useAuth } from './context/AuthContext';

const AttendanceScanner: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useAuth();
    const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [pointsWon, setPointsWon] = useState<number | null>(null);

    useEffect(() => {
        let scanner: Html5QrcodeScanner | null = null;

        if (status === 'scanning') {
            scanner = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );

            scanner.render(async (decodedText) => {
                if (scanner) {
                    scanner.clear().catch(console.error);
                }
                handleScan(decodedText);
            }, (error) => {
                // Ignore scanner errors
            });
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(console.error);
            }
        };
    }, [status]);

    const handleScan = async (token: string) => {
        setStatus('idle'); // Stop scanner
        try {
            const { data, error } = await (supabase.rpc as any)('claim_attendance_points', { p_token: token });

            if (error) throw error;

            if (data && data.success) {
                setStatus('success');
                setMessage(data.message);
                setPointsWon(data.points);
            } else {
                setStatus('error');
                setMessage(data ? data.message : 'Error desconocido');
            }
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setMessage('Error al procesar el código. Reintenta.');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-brand-silk dark:bg-brand-obsidian flex flex-col p-6 animate-in fade-in slide-in-from-bottom-10">
            <header className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-brand-obsidian dark:text-white">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-sm font-black uppercase tracking-widest text-brand-primary">Registrar Asistencia</h2>
                <div className="w-10" />
            </header>

            <div className="flex-1 flex flex-col items-center justify-center">
                {status === 'idle' && (
                    <div className="text-center space-y-8">
                        <div className="w-40 h-40 bg-brand-primary/10 rounded-[3rem] flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-6xl text-brand-primary">qr_code_scanner</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold dark:text-white mb-2">Escanear Código QR</h3>
                            <p className="opacity-60 text-sm max-w-xs mx-auto">Apunta con tu cámara al QR proyectado en la iglesia para sumar tus puntos de impacto.</p>
                        </div>
                        <button
                            onClick={() => setStatus('scanning')}
                            className="bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
                        >
                            Comenzar Escaneo
                        </button>
                    </div>
                )}

                {status === 'scanning' && (
                    <div className="w-full max-w-md space-y-6">
                        <div id="qr-reader" className="overflow-hidden rounded-[2.5rem] border-4 border-brand-primary shadow-2xl bg-black" />
                        <button
                            onClick={() => setStatus('idle')}
                            className="w-full py-4 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
                        >
                            Cancelar
                        </button>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center space-y-6 animate-in zoom-in-95">
                        <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                            <span className="material-symbols-outlined text-5xl text-white">check_circle</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-bold text-emerald-500">+{pointsWon} Puntos</h3>
                            <p className="dark:text-white font-medium">{message}</p>
                        </div>
                        <button
                            onClick={onBack}
                            className="bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl transition-all"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center space-y-6 animate-in zoom-in-95">
                        <div className="w-32 h-32 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-5xl text-rose-500">error</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-rose-500">Oops...</h3>
                            <p className="dark:text-white/60 text-sm max-w-xs mx-auto">{message}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setStatus('scanning')}
                                className="bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian px-12 py-4 rounded-full font-black uppercase tracking-widest shadow-xl transition-all"
                            >
                                Reintentar Escaneo
                            </button>
                            <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest opacity-50">Cerrar</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceScanner;
