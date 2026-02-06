import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../../lib/supabase';
import { useAuth } from './context/AuthContext';

const AttendanceScanner: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useAuth();
    const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error' | 'loading'>('idle');
    const [message, setMessage] = useState('');
    const [pointsWon, setPointsWon] = useState<number | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerId = "qr-reader-container";

    // Clean up scanner on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
            }
        };
    }, []);

    const startScanner = async () => {
        setStatus('loading');
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            const html5QrCode = new Html5Qrcode(containerId);
            scannerRef.current = html5QrCode;

            const qrConfig = { fps: 10, qrbox: { width: 250, height: 250 } };

            await html5QrCode.start(
                { facingMode: "environment" },
                qrConfig,
                (decodedText) => {
                    html5QrCode.stop().then(() => {
                        handleScan(decodedText);
                    }).catch(err => {
                        console.error("Error stopping scanner", err);
                        handleScan(decodedText);
                    });
                },
                (_) => {
                    // Ignore scanner errors
                }
            );
            setStatus('scanning');
        } catch (err: any) {
            console.error("Failed to start scanner", err);
            setStatus('error');
            setMessage('No se pudo acceder a la cámara. Revisa los permisos de tu navegador.');
        }
    };

    const handleScan = async (token: string) => {
        setStatus('loading');
        try {
            const { data, error } = await (supabase.rpc as any)('claim_attendance_points', { p_token: token });

            if (error) throw error;

            if (data && data.success) {
                setStatus('success');
                setMessage(data.message);
                setPointsWon(data.points);
            } else {
                setStatus('error');
                setMessage(data ? data.message : 'El código no es válido o ha expirado.');
            }
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setMessage('Error al procesar el código. Reintenta.');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-brand-silk dark:bg-brand-obsidian flex flex-col p-6 animate-reveal overflow-hidden">
            <header className="flex items-center justify-between mb-8 relative z-50">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-brand-obsidian dark:text-white shadow-lg active:scale-90 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-sm font-black uppercase tracking-widest text-brand-primary drop-shadow-sm">Registrar Asistencia</h2>
                <div className="w-10" />
            </header>

            <div className="flex-1 flex flex-col items-center justify-center relative">
                {status === 'idle' && (
                    <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-48 h-48 bg-brand-primary/10 rounded-[4rem] flex items-center justify-center mx-auto relative">
                            <div className="absolute inset-0 bg-brand-primary/20 rounded-[4rem] animate-ping opacity-20"></div>
                            <span className="material-symbols-outlined text-7xl text-brand-primary relative z-10">qr_code_scanner</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold dark:text-white mb-3 font-serif">Escanear Código</h3>
                            <p className="opacity-60 text-sm max-w-xs mx-auto leading-relaxed">Suma tus puntos de impacto escaneando el código QR proyectado hoy.</p>
                        </div>
                        <button
                            onClick={startScanner}
                            className="bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian px-12 py-5 rounded-full font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(0,0,0,0.15)] active:scale-95 transition-all"
                        >
                            Comenzar Escaneo
                        </button>
                    </div>
                )}

                {(status === 'scanning' || status === 'loading') && (
                    <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
                        <div className="relative aspect-square overflow-hidden rounded-[3rem] border-4 border-brand-primary shadow-2xl bg-black">
                            <div id={containerId} className="w-full h-full" />
                            {status === 'loading' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-brand-obsidian/80 backdrop-blur-sm z-20">
                                    <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                            <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none z-10"></div>
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-brand-primary animate-scan-line z-10 opacity-60"></div>
                        </div>

                        <div className="text-center">
                            <p className="text-brand-primary font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Escaneando...</p>
                        </div>

                        <button
                            onClick={() => {
                                if (scannerRef.current) scannerRef.current.stop().catch(() => { });
                                setStatus('idle');
                            }}
                            className="w-full py-4 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-base">close</span>
                            Cancelar
                        </button>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="w-32 h-32 bg-emerald-500 rounded-ultra flex items-center justify-center mx-auto shadow-[0_20px_50px_rgba(16,185,129,0.3)]">
                            <span className="material-symbols-outlined text-5xl text-white">check_circle</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-emerald-500 uppercase tracking-tight">+{pointsWon} Puntos</h3>
                            <p className="dark:text-white font-medium text-lg leading-relaxed">{message}</p>
                        </div>
                        <button
                            onClick={onBack}
                            className="bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian px-12 py-5 rounded-full font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="w-32 h-32 bg-rose-500/10 rounded-ultra flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-5xl text-rose-500">error</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-rose-500 font-serif">Aviso</h3>
                            <p className="dark:text-white/60 text-sm max-w-xs mx-auto leading-relaxed">{message}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={startScanner}
                                className="bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian px-12 py-4 rounded-full font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                            >
                                Reintentar
                            </button>
                            <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest opacity-50">Cerrar</button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes scan-line {
                    0% { transform: translateY(-125px); }
                    100% { transform: translateY(125px); }
                }
                .animate-scan-line {
                    animation: scan-line 2s ease-in-out infinite alternate;
                }
            `}</style>
        </div>
    );
};

export default AttendanceScanner;
