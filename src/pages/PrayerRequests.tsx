import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../components/context/AuthContext';
import { usePrayerRequests } from '../hooks/usePrayerRequests';
import { useReportContent } from '../hooks/useReports';
import { SmartImage } from '../components/ui/SmartImage';
import InteractionListModal from '../components/ui/InteractionListModal';

const PrayerRequests: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'create'>('list');

  // DATA
  const { requests, isLoading, addRequest, deleteRequest, toggleInteraction } = usePrayerRequests('all');

  // CREATE STATE
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [isPrivate, setIsPrivate] = useState(false);
  const [audioBlob, setAudioBlob] = useState<string | null>(null);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // AUDIO PLAYBACK
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // MODAL
  const [interactionsModalRequest, setInteractionsModalRequest] = useState<any | null>(null);

  // MENU STATE
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // SCROLL
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (highlightId && !isLoading && itemRefs.current[highlightId]) {
      setTimeout(() => itemRefs.current[highlightId]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
    }
  }, [highlightId, isLoading]);

  // CLICK OUTSIDE MENU
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const reportContent = useReportContent();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const type = mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        setMediaBlob(blob);
        const reader = new FileReader();
        reader.onloadend = () => setAudioBlob(reader.result as string);
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = window.setInterval(() => setRecordingDuration(p => p + 1), 1000);
    } catch (e) {
      console.error(e);
      alert("Error al acceder al micrófono.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
    setIsRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const formatTime = (s: number) => {
    if (!s) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const togglePlay = (id: string, url: string) => {
    if (playingId === id) {
      if (audioRef.current?.paused) audioRef.current.play();
      else audioRef.current?.pause();
    } else {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
      audioRef.current = new Audio(url);
      setPlayingId(id);
      setProgress(0);
      audioRef.current.addEventListener('timeupdate', () => { if (audioRef.current) setProgress(audioRef.current.currentTime); });
      audioRef.current.addEventListener('loadedmetadata', () => { if (audioRef.current) setDuration(audioRef.current.duration); });
      audioRef.current.addEventListener('ended', () => { setPlayingId(null); setProgress(0); });
      audioRef.current.play();
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    try {
      await addRequest.mutateAsync({
        content,
        category,
        is_private: isPrivate,
        mediaBlob,
        duration: recordingDuration > 0 ? formatTime(recordingDuration) : undefined
      });
      resetForm();
    } catch (e) { console.error(e); }
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Borrar esta petición?")) deleteRequest.mutate(id);
  };

  const resetForm = () => {
    setView('list'); setContent(''); setIsPrivate(false); setCategory('General');
    setAudioBlob(null); setMediaBlob(null); setRecordingDuration(0); setIsRecording(false);
  };

  const handleReport = (id: string) => {
    if (confirm('¿Deseas reportar esta petición como inapropiada?')) {
      reportContent.mutate(
        { contentType: 'prayer_request', contentId: id },
        {
          onSuccess: () => alert('Petición reportada. Gracias por ayudarnos.'),
          onError: (err: any) => {
            if (err.message === 'Ya reportaste este contenido') {
              alert('Ya has reportado esta petición.');
            } else {
              alert('Error al reportar.');
            }
          }
        }
      );
    }
  };

  // CREATE MODAL (PORTAL)
  if (view === 'create') {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-black flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-300">
        {/* Header */}
        <div className="px-6 py-8 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-white/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 z-50">
          <button onClick={resetForm} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="text-sm font-black uppercase tracking-widest text-brand-primary">
            Nueva Petición
          </h2>
          <button onClick={handleSave} className="bg-brand-obsidian dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg hover:transform hover:scale-105 transition-all">
            Publicar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 max-w-3xl mx-auto w-full">
          {/* Category Selector */}
          <div className="flex gap-2 overflow-x-auto mb-8 pb-2 no-scrollbar">
            {['Salud', 'Familia', 'Finanzas', 'Gratitud', 'Espiritual', 'General'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${category === cat
                  ? 'bg-brand-obsidian text-white dark:bg-white dark:text-black shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <textarea
            className="w-full h-[300px] resize-none text-2xl md:text-3xl font-serif font-medium leading-relaxed text-brand-obsidian dark:text-white bg-transparent border-none focus:ring-0 p-0 placeholder:text-gray-200 dark:placeholder:text-zinc-800"
            placeholder="¿Por qué oramos hoy?"
            value={content}
            onChange={e => setContent(e.target.value)}
            autoFocus
          />

          <div className="mt-8 flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
            <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isPrivate ? 'bg-brand-primary' : 'bg-gray-300 dark:bg-white/20'}`} onClick={() => setIsPrivate(!isPrivate)}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isPrivate ? 'left-7' : 'left-1'}`}></div>
            </div>
            <div>
              <p className="text-xs font-bold text-brand-obsidian dark:text-white uppercase tracking-wider">Privado</p>
            </div>
          </div>
        </div>

        {/* Recorder Bar */}
        <div className="p-6 bg-white dark:bg-black border-t border-gray-100 dark:border-white/10 pb-10">
          <div className="max-w-md mx-auto bg-gray-50 dark:bg-zinc-900 rounded-full p-2 pr-6 flex items-center gap-4 shadow-sm border border-gray-100 dark:border-zinc-800">
            {audioBlob ? (
              <>
                <button onClick={() => setAudioBlob(null)} className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">delete</span>
                </button>
                <audio src={audioBlob} controls className="h-8 w-full accent-brand-primary" />
              </>
            ) : (
              <>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-md ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-brand-obsidian dark:bg-brand-primary dark:text-brand-obsidian'}`}
                >
                  <span className="material-symbols-outlined">{isRecording ? 'stop' : 'mic'}</span>
                </button>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-brand-obsidian dark:text-white uppercase tracking-wider">{isRecording ? 'Grabando...' : 'Añadir voz'}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{isRecording ? formatTime(recordingDuration) : 'Opcional'}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return (
    <div className="min-h-screen bg-brand-silk dark:bg-brand-obsidian transition-colors animate-reveal">

      <div className="max-w-2xl mx-auto px-6 pt-12 pb-40">

        {/* HEADER */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse shadow-[0_0_10px_#ffb700]"></div>
            <span className="text-brand-obsidian/60 dark:text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Altar Digital</span>
          </div>

          <div className="flex items-end justify-between">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tight leading-[0.9]">
              Peticiones <br /> <span className="text-brand-obsidian/80 dark:text-white/80 italic">y Milagros</span>
            </h1>

            <div className="flex gap-3">
              {onBack && (
                <button onClick={onBack} className="w-14 h-14 bg-white dark:bg-white/10 rounded-[1.5rem] flex items-center justify-center text-brand-obsidian dark:text-white shadow-sm hover:shadow-md transition-all">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
              )}
              <button
                onClick={() => setView('create')}
                className="w-14 h-14 bg-brand-obsidian dark:bg-white rounded-[1.5rem] flex items-center justify-center text-white dark:text-black shadow-2xl hover:scale-105 active:scale-95 transition-all group"
              >
                <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">add</span>
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {isLoading && (
            <div className="py-20 text-center text-brand-obsidian/30 dark:text-white/30 font-serif italic text-xl">
              Cargando peticiones...
            </div>
          )}

          {requests.map((req: any) => (
            <article
              key={req.id}
              ref={el => itemRefs.current[req.id] = el}
              className="bg-white dark:bg-brand-surface rounded-[2rem] p-6 md:p-10 shadow-lg border border-brand-obsidian/5 dark:border-white/5 relative group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              {/* DECORATIVE BACKGROUND */}
              <span className="font-serif text-[180px] absolute -top-12 left-2 text-brand-primary/5 dark:text-white/5 pointer-events-none select-none z-0">
                “
              </span>
              {/* THREE-DOT MENU */}
              {user && (
                <div className="absolute top-6 right-6 z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === req.id ? null : req.id); }}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors"
                  >
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>

                  {openMenuId === req.id && (
                    <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 animate-in zoom-in-95 duration-200 origin-top-right">
                      {user.id !== req.user_id && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); handleReport(req.id); }}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">flag</span> Reportar
                        </button>
                      )}
                      {(user.id === req.user_id || user.role === 'SUPER_ADMIN') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); handleDelete(req.id); }}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* USER INFO */}
              <div className="flex items-center gap-4 mb-8 cursor-pointer group/profile relative z-10" onClick={() => navigate(`/profile/${req.user_id}`)}>
                <div className="relative">
                  <SmartImage
                    src={req.user?.avatar_url}
                    className="rounded-full object-cover border-2 border-brand-primary/20 dark:border-white/10 p-[2px] transition-transform group-hover/profile:scale-105"
                    style={{ width: '48px', height: '48px' }}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-brand-primary w-5 h-5 rounded-full border-2 border-white dark:border-brand-surface flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[10px] text-white">volunteer_activism</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-obsidian dark:text-white leading-none group-hover/profile:text-brand-primary transition-colors">
                    {req.user?.name || 'Anónimo'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-[9px] font-black text-brand-obsidian/60 dark:text-white/60 bg-brand-silk dark:bg-white/5 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {req.category}
                    </span>
                    {req.is_private && (
                      <span className="text-[9px] font-black text-white bg-red-500/90 px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                        <span className="material-symbols-outlined text-[10px]">lock</span> Privado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* AUDIO PLAYER */}
              {req.audioUrl && (
                <div className={`
                    mb-8 rounded-[1.5rem] p-4 flex items-center gap-4 transition-all duration-500 relative z-10
                    ${playingId === req.id
                    ? 'bg-gradient-to-r from-brand-primary/20 to-transparent border border-brand-primary/30 shadow-lg scale-[1.02]'
                    : 'bg-gray-50 dark:bg-white/5 text-brand-obsidian dark:text-white border border-gray-100 dark:border-white/10'
                  }
                  `}>
                  <button
                    onClick={() => togglePlay(req.id, req.audioUrl)}
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90
                      ${playingId === req.id ? 'bg-brand-primary text-brand-obsidian shadow-[0_0_15px_rgba(255,183,0,0.5)]' : 'bg-white dark:bg-black/20 text-brand-obsidian dark:text-white shadow-sm hover:scale-105'}
                    `}
                  >
                    <span className="material-symbols-outlined fill-1 text-2xl">
                      {playingId === req.id ? 'pause' : 'play_arrow'}
                    </span>
                  </button>

                  <div className="flex-1 flex flex-col justify-center gap-1.5">
                    <div className="flex justify-between items-end text-[10px] font-mono font-bold uppercase tracking-widest opacity-80">
                      <span className={playingId === req.id ? 'text-brand-obsidian dark:text-brand-primary' : ''}>{playingId === req.id ? formatTime(progress) : 'Audio Petición'}</span>
                      <span className="opacity-60">{playingId === req.id ? formatTime(duration) : (req.duration || '0:00')}</span>
                    </div>

                    <div className="h-1.5 w-full bg-current/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-100 ease-linear rounded-full ${playingId === req.id ? 'bg-brand-primary' : 'bg-brand-primary/60 dark:bg-white/40'}`}
                        style={{ width: playingId === req.id ? `${(progress / duration) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENT */}
              <div className="mb-8 relative z-10 pl-2">
                <p className="text-xl md:text-2xl font-serif font-medium text-brand-obsidian dark:text-white leading-relaxed whitespace-pre-line italic">
                  "{req.content}"
                </p>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5 relative z-10">
                <button
                  onClick={() => toggleInteraction.mutate({ requestId: req.id, type: 'amen' })}
                  className={`
                    px-6 py-2.5 rounded-full flex items-center gap-2 transition-all duration-300
                    ${req.user_has_interacted
                      ? 'bg-brand-primary text-brand-obsidian shadow-[0_0_15px_rgba(255,183,0,0.4)] scale-105'
                      : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-white hover:text-brand-primary hover:shadow-md border border-transparent hover:border-gray-100 dark:hover:border-white/10'
                    }
                  `}
                >
                  <span className={`material-symbols-outlined text-lg transition-transform ${req.user_has_interacted ? 'fill-1 scale-110' : ''}`}>bg_connect</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Amén</span>
                </button>

                {req.interaction_count > 0 && (
                  <button
                    onClick={() => setInteractionsModalRequest(req)}
                    className="flex items-center gap-2 pl-4 py-2 hover:opacity-70 transition-opacity bg-brand-silk/50 dark:bg-white/5 px-4 rounded-full"
                  >
                    <div className="flex -space-x-2">
                      {(req.interactions || []).slice(0, 3).map((i: any, idx: number) => (
                        <div key={idx} className="w-7 h-7 rounded-full border-2 border-white dark:border-brand-surface overflow-hidden bg-gray-100 shadow-sm relative z-10 hover:z-20 hover:scale-110 transition-transform">
                          <img src={i.user?.avatar_url} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                      +{req.interaction_count} Unid{req.interaction_count === 1 ? 'o' : 'os'}
                    </span>
                  </button>
                )}
              </div>

            </article>
          ))}
        </div>

        {interactionsModalRequest && (
          <InteractionListModal
            interactions={interactionsModalRequest.interactions || []}
            onClose={() => setInteractionsModalRequest(null)}
            title="Orando por ti"
            onUserClick={(uid) => { setInteractionsModalRequest(null); navigate(`/profile/${uid}`); }}
          />
        )}
      </div>
    </div>
  );
};

export default PrayerRequests;
