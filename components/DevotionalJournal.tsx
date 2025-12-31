import React, { useState, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useDevotionals } from '../src/hooks/useDevotionals';
import { SmartImage } from './ui/SmartImage';

const DevotionalJournal: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');

  // Navigation & Filter State
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  const [view, setView] = useState<'feed' | 'create'>('feed');
  const [searchTerm, setSearchTerm] = useState('');

  // Hook Integration
  const {
    devotionals,
    isLoading,
    addDevotional,
    deleteDevotional,
    editDevotional,
    awardListenPoints
  } = useDevotionals(activeTab);

  // Refs for scrolling
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Scroll to highlighted item on load
  useEffect(() => {
    if (highlightId && !isLoading && itemRefs.current[highlightId]) {
      setTimeout(() => {
        itemRefs.current[highlightId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [highlightId, isLoading, devotionals]);

  // Form State
  const [isRecording, setIsRecording] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [verse, setVerse] = useState('');
  const [content, setContent] = useState('');
  const [audioBlob, setAudioBlob] = useState<string | null>(null);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // --- PLAYBACK LOGIC ---
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);
  const feedAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  // Menu State (Card ID that has menu open)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (feedAudioRef.current) {
        feedAudioRef.current.pause();
        feedAudioRef.current = null;
      }
    };
  }, []);

  const formatTime = (s: number) => {
    if (!s || isNaN(s) || !isFinite(s)) return '0:00';
    const minutes = Math.floor(s / 60);
    const seconds = Math.floor(s % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // --- RECORDING LOGIC ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setMediaBlob(blob);
        const reader = new FileReader();
        reader.onloadend = () => setAudioBlob(reader.result as string);
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = window.setInterval(() => setRecordingDuration(p => p + 1), 1000);
    } catch (err) {
      alert("Para grabar tu reflexión, por favor permite el acceso al micrófono.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handlePlayAudio = (id: string, url: string) => {
    if (playingId === id) {
      if (feedAudioRef.current) {
        if (feedAudioRef.current.paused) {
          feedAudioRef.current.play();
        } else {
          feedAudioRef.current.pause();
          setPlayingId(null);
        }
      }
      return;
    }

    if (feedAudioRef.current) {
      feedAudioRef.current.pause();
      feedAudioRef.current = null;
    }

    const audio = new Audio(url);
    feedAudioRef.current = audio;
    setCurrentTime(0);
    setTrackDuration(0);
    setPlayingId(id);

    audio.addEventListener('loadedmetadata', () => setTrackDuration(audio.duration));
    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('ended', () => {
      setPlayingId(null);
      setCurrentTime(0);
      awardListenPoints();
    });

    audio.play().catch(e => console.error("Playback error:", e));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (feedAudioRef.current) {
      const time = Number(e.target.value);
      feedAudioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // --- CRUD HANDLERS ---
  const handleSave = async () => {
    try {
      if (editingId) {
        await editDevotional.mutateAsync({
          id: editingId,
          updates: { title, content, bibleVerse: verse }
        });
      } else {
        await addDevotional.mutateAsync({
          title,
          content,
          bible_verse: verse,
          mediaBlob,
          duration: recordingDuration > 0 ? formatTime(recordingDuration) : undefined
        });
      }
      setView('feed');
      resetForm();
    } catch (e) {
      console.error(e);
      alert("Error al guardar.");
    }
  };

  const handleEdit = (devo: any) => {
    setEditingId(devo.id);
    setTitle(devo.title);
    setVerse(devo.bibleVerse || devo.bible_verse);
    setContent(devo.content);
    setOpenMenuId(null);
    setView('create');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta entrada?")) {
      await deleteDevotional.mutateAsync(id);
      setOpenMenuId(null);
    }
  };

  const resetForm = () => {
    setEditingId(null); setTitle(''); setVerse(''); setContent(''); setAudioBlob(null); setMediaBlob(null); setRecordingDuration(0);
  };

  // --- FILTERING ---
  const filteredDevotionals = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return devotionals;
    return devotionals.filter(devo =>
      devo.title.toLowerCase().includes(term) ||
      devo.content.toLowerCase().includes(term) ||
      (devo.bibleVerse || '').toLowerCase().includes(term)
    );
  }, [devotionals, searchTerm]);

  // Click outside to close menus
  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  return (
    <div className="min-h-screen bg-brand-silk dark:bg-brand-obsidian transition-colors duration-500">

      <div className="px-6 pt-12 pb-44 max-w-2xl mx-auto animate-reveal">
        <header className="flex justify-between items-end mb-8">
          <div>
            <p className="text-brand-primary text-[10px] font-black uppercase tracking-[0.5em] mb-3">Mi Caminar</p>
            <h2 className="text-5xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tighter leading-none">
              Bitácora <br /><span className="gold-text-gradient italic">de Gracia</span>
            </h2>
          </div>
          <button
            onClick={() => { resetForm(); setView('create'); }}
            className="w-16 h-16 rounded-full bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian shadow-2xl flex items-center justify-center active:scale-90 transition-all group border-4 border-white dark:border-brand-obsidian"
          >
            <span className="material-symbols-outlined text-3xl font-black group-hover:rotate-90 transition-transform">add</span>
          </button>
        </header>

        {/* TABS FILTER */}
        <div className="flex gap-4 mb-8 border-b border-brand-obsidian/10 dark:border-white/10 pb-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'all' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-obsidian/40 dark:text-white/40'}`}
          >
            Comunidad
          </button>
          <button
            onClick={() => setActiveTab('mine')}
            className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'mine' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-obsidian/40 dark:text-white/40'}`}
          >
            Mis Entradas
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative mb-12 group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-brand-primary/60 group-focus-within:text-brand-primary transition-colors">search</span>
          </div>
          <input
            type="text"
            placeholder="Buscar en el registro..."
            className="w-full bg-white dark:bg-brand-surface border border-brand-obsidian/10 dark:border-white/10 rounded-full py-4 pl-16 pr-14 text-sm text-brand-obsidian dark:text-brand-silk placeholder:text-brand-obsidian/40 dark:placeholder:text-white/30 focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-6 flex items-center text-brand-obsidian/20 dark:text-white/40 hover:text-brand-primary transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        <div className="space-y-8">
          {isLoading ? (
            <p className="text-center text-brand-obsidian/40 dark:text-white/40 italic">Cargando...</p>
          ) : filteredDevotionals.length === 0 ? (
            <div className="text-center py-10 opacity-60">
              <span className="material-symbols-outlined text-4xl mb-2">menu_book</span>
              <p className="text-sm">No hay entradas aún.</p>
            </div>
          ) : (
            filteredDevotionals.map((devo: any) => {
              const isPlaying = playingId === devo.id;

              return (
                <article
                  key={devo.id}
                  ref={el => itemRefs.current[devo.id] = el}
                  className={`
                        relative
                        bg-white dark:bg-white/5 
                        rounded-3xl 
                        p-6 md:p-8
                        border border-gray-100 dark:border-white/5
                        transition-all duration-300
                        ${isPlaying ? 'shadow-xl dark:shadow-brand-primary/10 ring-1 ring-brand-primary/20' : 'shadow-sm hover:shadow-lg'}
                      `}
                >

                  {/* HEADER: Avatar, Name & Options */}
                  <div className="flex justify-between items-start mb-6">
                    <div
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => navigate(`/profile/${devo.user_id}`)}
                    >
                      <SmartImage
                        src={devo.userAvatar}
                        className="w-[40px] h-[40px] rounded-full object-cover border border-black/5 dark:border-white/10 group-hover:border-brand-primary transition-colors"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-brand-obsidian dark:text-white leading-none group-hover:text-brand-primary transition-colors">
                          {devo.userName || "Anónimo"}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(devo.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Options Menu (Three Dots) - Only for Owner */}
                    {user && user.id === devo.user_id && (
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === devo.id ? null : devo.id); }}
                          className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors"
                        >
                          <span className="material-symbols-outlined">more_horiz</span>
                        </button>

                        {openMenuId === devo.id && (
                          <div className="absolute top-full right-0 mt-2 bg-white dark:bg-brand-surface border border-gray-100 dark:border-white/10 shadow-xl rounded-xl overflow-hidden py-1 min-w-[120px] z-20 animate-in fade-in zoom-in-95 duration-200">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEdit(devo); }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors text-left"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span> Editar
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(devo.id); }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors text-left"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* BODY */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold font-serif text-brand-obsidian dark:text-white mb-2">
                      {devo.title}
                    </h3>
                    {devo.bibleVerse && (
                      <p className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-4">
                        {devo.bibleVerse || devo.bible_verse}
                      </p>
                    )}

                    {devo.content && (
                      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 font-medium">
                        "{devo.content}"
                      </p>
                    )}
                  </div>

                  {/* AUDIO PLAYER (Elegant Footer) */}
                  {devo.audioUrl && (
                    <div className={`
                        flex items-center gap-3 bg-gray-50 dark:bg-black/20 p-2 rounded-full border border-gray-100 dark:border-white/5
                        ${isPlaying ? 'ring-1 ring-brand-primary/30' : ''}
                      `}>
                      <button
                        onClick={() => handlePlayAudio(devo.id, devo.audioUrl)}
                        className={`
                             w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all
                             ${isPlaying ? 'bg-brand-primary text-white shadow-lg scale-105' : 'bg-white dark:bg-white/10 text-brand-obsidian dark:text-white hover:bg-brand-primary hover:text-white'}
                           `}
                      >
                        <span className="material-symbols-outlined text-lg">{isPlaying ? 'pause' : 'play_arrow'}</span>
                      </button>

                      <div className="flex-1 pt-1">
                        <input
                          type="range"
                          min={0}
                          max={trackDuration || 0.1}
                          value={currentTime}
                          onChange={handleSeek}
                          className="w-full h-1 bg-gray-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-primary block"
                          disabled={!isPlaying}
                        />
                      </div>

                      <div className="text-[9px] font-bold tabular-nums text-gray-400 px-2 min-w-[32px] text-right">
                        {isPlaying ? formatTime(currentTime) : (devo.duration || '0:00')}
                      </div>
                    </div>
                  )}

                </article>
              );
            }))}
        </div>
      </div>

      {view === 'create' && createPortal(
        <div className="fixed inset-0 z-[5000] bg-brand-silk dark:bg-brand-obsidian flex flex-col pt-safe-top pb-safe-bottom animate-in fade-in duration-300">
          {/* CREATE MODAL CONTENT (Same as before) */}
          <div className="h-24 px-6 flex items-center justify-between border-b border-brand-obsidian/5 dark:border-white/10 bg-brand-silk/90 dark:bg-brand-obsidian/90 backdrop-blur-3xl z-50 shrink-0">
            <button onClick={() => { setView('feed'); resetForm(); }} className="w-12 h-12 rounded-2xl bg-brand-obsidian/5 dark:bg-white/10 flex items-center justify-center text-brand-obsidian/40 dark:text-white/60 active:scale-90 transition-all">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em] hidden md:block">
              {editingId ? 'Editar Reflexión' : 'Nuevo Encuentro'}
            </h4>
            <button onClick={handleSave} disabled={!title || (!content && !audioBlob && !editingId)} className="bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl disabled:opacity-20 active:scale-95 transition-all">
              {editingId ? 'Actualizar' : 'Publicar'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto w-full px-6 py-8 flex flex-col gap-8 max-w-4xl mx-auto">
            {/* Fields */}
            <div className="space-y-6">
              <input autoFocus placeholder="Título de tu encuentro..." className="w-full text-4xl md:text-5xl font-serif font-bold bg-transparent border-none focus:ring-0 text-brand-obsidian dark:text-white placeholder:text-brand-obsidian/10 dark:placeholder:text-white/20 tracking-tighter p-0" value={title} onChange={(e) => setTitle(e.target.value)} />
              <div className="flex items-center gap-4 bg-brand-primary/[0.08] dark:bg-brand-primary/10 px-4 py-3 rounded-xl border border-brand-primary/30 w-full md:w-fit">
                <span className="material-symbols-outlined text-brand-primary text-xl font-black shrink-0">menu_book</span>
                <input placeholder="Pasaje clave (Ej: Salmos 23)" className="w-full md:w-72 text-sm font-black bg-transparent border-none focus:ring-0 text-brand-primary placeholder:text-brand-primary/40 uppercase tracking-widest p-0" value={verse} onChange={(e) => setVerse(e.target.value)} />
              </div>
            </div>
            <textarea placeholder="Escribe lo que el Espíritu pone hoy en tu corazón..." className="w-full flex-1 bg-transparent border-none focus:ring-0 text-xl font-light text-brand-obsidian/80 dark:text-brand-silk leading-relaxed italic resize-none placeholder:text-brand-obsidian/10 dark:placeholder:text-white/10 p-0 min-h-[300px]" value={content} onChange={(e) => setContent(e.target.value)}></textarea>
            <div className="h-32"></div>

            {!editingId && (
              <div className="fixed bottom-8 left-0 right-0 flex justify-center px-6 z-[700] pointer-events-none pb-[env(safe-area-inset-bottom)]">
                <div className="bg-white/95 dark:bg-brand-surface/95 backdrop-blur-2xl border-2 border-brand-obsidian/5 dark:border-white/10 p-4 rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.4)] pointer-events-auto flex items-center gap-4 min-w-[280px]">
                  {isRecording ? (
                    <div className="flex items-center gap-4 w-full px-2">
                      <div className="flex items-center gap-2 bg-red-600/10 dark:bg-red-500/20 px-4 py-2 rounded-full border border-red-500/30">
                        <div className="w-2.5 h-2.5 bg-red-600 dark:bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_#ef4444]"></div>
                        <span className="text-xl font-outfit font-black text-red-600 dark:text-red-500 tabular-nums leading-none">{formatTime(recordingDuration)}</span>
                      </div>
                      <button onClick={stopRecording} className="w-14 h-14 rounded-full bg-red-600 dark:bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all border-4 border-white dark:border-brand-obsidian ml-auto">
                        <span className="material-symbols-outlined text-3xl fill-1">stop</span>
                      </button>
                    </div>
                  ) : audioBlob ? (
                    <div className="flex items-center gap-4 w-full px-2">
                      <div className="flex-1 bg-brand-silk/50 dark:bg-brand-obsidian/40 rounded-full px-3 py-1.5 border border-brand-primary/20 flex items-center">
                        <audio controls src={audioBlob} className="w-full h-8 accent-brand-primary" />
                      </div>
                      <button onClick={() => setAudioBlob(null)} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shrink-0">
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 px-2 w-full">
                      <button onClick={startRecording} className="w-14 h-14 rounded-full bg-brand-obsidian dark:bg-brand-primary text-brand-primary dark:text-brand-obsidian flex items-center justify-center shadow-lg active:scale-90 transition-all border-4 border-brand-silk dark:border-brand-obsidian">
                        <span className="material-symbols-outlined text-2xl font-black">mic</span>
                      </button>
                      <div className="flex flex-col">
                        <p className="text-[10px] font-black text-brand-obsidian/60 dark:text-white uppercase tracking-[0.4em] mb-1 leading-none">Añadir Voz</p>
                        <span className="text-[8px] text-brand-primary font-black uppercase tracking-widest leading-none">Grabar Reflexión</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default DevotionalJournal;
