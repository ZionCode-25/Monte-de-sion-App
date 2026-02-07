import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAdminAttendance } from '../../hooks/admin/useAdminAttendance';
import { AttendanceSession } from '../../types';

interface AdminAttendanceProps {
    user: any;
    triggerToast: (msg: string) => void;
}

const AdminAttendance: React.FC<AdminAttendanceProps> = ({ user, triggerToast }) => {
    const { attendanceSessions, isLoading, createAttendanceSessionMutation, updateAttendanceStatusMutation, clearAttendanceHistoryMutation } = useAdminAttendance(user, 'attendance');

    const [selectedAttendanceSession, setSelectedAttendanceSession] = useState<AttendanceSession | null>(null);
    const [attendanceForm, setAttendanceForm] = useState({
        event_name: '',
        points: 50,
        expires_in_hours: 2
    });

    const handleCreate = () => {
        const active = attendanceSessions.find((s: AttendanceSession) => s.status === 'active' && new Date(s.expires_at) > new Date());

        if (active) {
            if (confirm("Ya tienes un QR activo. ¿Deseas finalizar el actual y crear uno nuevo?")) {
                updateAttendanceStatusMutation.mutate({
                    id: active.id,
                    status: 'finished',
                    expires_at: new Date().toISOString()
                }, {
                    onSuccess: () => createAttendanceSessionMutation.mutate(attendanceForm, {
                        onSuccess: () => {
                            triggerToast("Nuevo QR generado");
                            setAttendanceForm({ event_name: '', points: 50, expires_in_hours: 2 });
                        }
                    })
                });
            }
        } else {
            createAttendanceSessionMutation.mutate(attendanceForm, {
                onSuccess: () => {
                    triggerToast("QR generado correctamente");
                    setAttendanceForm({ event_name: '', points: 50, expires_in_hours: 2 });
                },
                onError: () => triggerToast("Error al generar QR")
            });
        }
    };

    return (
        <div className="flex flex-col h-full bg-brand-bg dark:bg-black/90">

            {/* Header */}
            <div className="flex-none p-6 md:p-8 border-b border-brand-obsidian/5 dark:border-white/5">
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white leading-none tracking-tight">
                    Control de Asistencia
                </h2>
                <p className="mt-2 text-brand-obsidian/40 dark:text-white/40 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                    Genera códigos QR para registrar la asistencia y otorgar puntos.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Create Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-brand-surface p-8 rounded-[2.5rem] shadow-xl border border-brand-obsidian/5 dark:border-white/5 space-y-6">
                            <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand-primary">qr_code_Scanner</span>
                                Generar QR
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">Evento</label>
                                    <input
                                        className="w-full bg-brand-silk dark:bg-black/20 p-4 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary font-bold text-sm"
                                        placeholder="Ej: Culto Dominical"
                                        value={attendanceForm.event_name}
                                        onChange={e => setAttendanceForm({ ...attendanceForm, event_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">Puntos</label>
                                    <input
                                        type="number"
                                        className="w-full bg-brand-silk dark:bg-black/20 p-4 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary font-bold text-sm"
                                        value={attendanceForm.points}
                                        onChange={e => setAttendanceForm({ ...attendanceForm, points: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 px-1">Validez (horas)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-brand-silk dark:bg-black/20 p-4 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary font-bold text-sm"
                                        value={attendanceForm.expires_in_hours}
                                        onChange={e => setAttendanceForm({ ...attendanceForm, expires_in_hours: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleCreate}
                                disabled={!attendanceForm.event_name}
                                className="w-full py-4 bg-brand-primary text-brand-obsidian font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                            >
                                Generar Código
                            </button>
                        </div>
                    </div>

                    {/* History List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold dark:text-white">Historial Reciente</h3>
                            {attendanceSessions.length > 0 && (
                                <button
                                    onClick={() => { if (confirm("¿Borrar todo el historial?")) clearAttendanceHistoryMutation.mutate(); }}
                                    className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 px-3 py-2 rounded-lg transition-all"
                                >
                                    Vaciar Historial
                                </button>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="text-center p-10 opacity-50">Cargando historial...</div>
                        ) : attendanceSessions.length === 0 ? (
                            <div className="bg-white dark:bg-brand-surface p-12 rounded-[3rem] text-center border border-brand-obsidian/5 opacity-50 italic">
                                No hay sesiones generadas aún.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {attendanceSessions.map((session) => {
                                    const isExpired = new Date(session.expires_at) < new Date();
                                    const isActive = session.status === 'active' && !isExpired;
                                    const isPaused = session.status === 'paused';

                                    return (
                                        <div key={session.id} className="bg-white dark:bg-brand-surface px-6 py-4 rounded-2xl border border-brand-obsidian/5 dark:border-white/5 flex items-center justify-between group hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : isPaused ? 'bg-amber-500' : 'bg-rose-500'} `} />
                                                <div>
                                                    <h4 className="font-bold text-sm text-brand-obsidian dark:text-white">{session.event_name}</h4>
                                                    <p className="text-[9px] opacity-40 uppercase font-black tracking-widest">
                                                        {session.points} pts • {new Date(session.created_at).toLocaleDateString()} • {session.status.toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedAttendanceSession(session)}
                                                    className="p-2 rounded-lg bg-brand-silk dark:bg-white/5 text-brand-primary hover:bg-brand-primary hover:text-brand-obsidian transition-all"
                                                    title="Ver QR"
                                                >
                                                    <span className="material-symbols-outlined text-lg">fullscreen</span>
                                                </button>
                                                {isActive && (
                                                    <button
                                                        onClick={() => updateAttendanceStatusMutation.mutate({ id: session.id, status: 'paused' })}
                                                        className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"
                                                        title="Pausar"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">pause</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* QR Modal */}
            {selectedAttendanceSession && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300" onClick={() => setSelectedAttendanceSession(null)}>
                    <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center text-center max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <div className="mb-6">
                            <h3 className="text-2xl font-black text-brand-obsidian uppercase tracking-tighter">{selectedAttendanceSession.event_name}</h3>
                            <p className="text-brand-primary font-bold uppercase tracking-widest text-xs mt-1">{selectedAttendanceSession.points} Puntos</p>
                        </div>

                        <div className="p-4 bg-white rounded-xl shadow-inner border-2 border-brand-obsidian/5">
                            <QRCodeCanvas
                                value={JSON.stringify({
                                    code: selectedAttendanceSession.code,
                                    sessionId: selectedAttendanceSession.id,
                                    points: selectedAttendanceSession.points
                                })}
                                size={250}
                                id="qr-canvas"
                            />
                        </div>

                        <p className="mt-8 text-4xl font-mono font-bold tracking-[0.5em] text-brand-obsidian/80">
                            {selectedAttendanceSession.code}
                        </p>
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 mt-2">Código Manual</p>

                        <button onClick={() => setSelectedAttendanceSession(null)} className="mt-8 px-8 py-3 bg-brand-silk text-brand-obsidian font-bold rounded-xl hover:bg-brand-obsidian hover:text-white transition-all uppercase tracking-widest text-xs">
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminAttendance;
