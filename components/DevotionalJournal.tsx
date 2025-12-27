import React, { useState, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from './context/AuthContext';
import { useDevotionals } from '../src/hooks/useDevotionals';

const DevotionalJournal: React.FC = () => {
  const { user } = useAuth();

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

  // Form State
  const [isRecording, setIsRecording] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // If set, we are editing
  const [title, setTitle] = useState('');
  const [verse, setVerse] = useState('');
  const [content, setContent] = useState('');
  const [audioBlob, setAudioBlob] = useState<string | null>(null);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Playback State
  const [playingId, setPlayingId] = useState<string | null>(null);
  const feedAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (feedAudioRef.current) {
        feedAudioRef.current.pause();
        feedAudioRef.current = null;
      }
    };
  }, []);

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

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // --- PLAYBACK LOGIC ---
  const handlePlayAudio = (id: string, url: string) => {
    if (playingId === id) {
      feedAudioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (feedAudioRef.current) feedAudioRef.current.pause();
      const audio = new Audio(url);
      feedAudioRef.current = audio;
      audio.play();
      setPlayingId(id);

      // On finish, award points!
      audio.onended = () => {
        setPlayingId(null);
        awardListenPoints();
        // Visual feedback (optional) could be added here
      };
    }
  };

  // --- CRUD HANDLERS ---
  const handleSave = async () => {
    try {
      if (editingId) {
        await editDevotional.mutateAsync({
          id: editingId,
          updates: { title, content, bibleVerse: verse }
          // Note: Updating audio is not implemented in this simple edit flow yet
        });
      } else {
        await addDevotional.mutateAsync({
          title,
          content,
          bible_verse: verse, // hook expects snake_case input or we map it inside
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
    setVerse(devo.bibleVerse || devo.bible_verse); // handle both
    setContent(devo.content);
    // Audio editing not supported in this quick edit, keep existing
    setView('create');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta entrada?")) {
      await deleteDevotional.mutateAsync(id);
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

        <div className="space-y-12">
          {isLoading ? (
            <p className="text-center text-brand-obsidian/40 dark:text-white/40 italic">Cargando...</p>
          ) : filteredDevotionals.length === 0 ? (
            <div className="text-center py-10 opacity-60">
              <span className="material-symbols-outlined text-4xl mb-2">menu_book</span>
              <p className="text-sm">No hay entradas aún.</p>
            </div>
          ) : (
            filteredDevotionals.map((devo: any) => (
              <article key={devo.id} className="group relative bg-white dark:bg-brand-surface p-8 rounded-[2.5rem] border border-brand-obsidian/[0.05] dark:border-white/5 shadow-sm hover:shadow-2xl transition-all animate-reveal">

                {/* Context Action Menu for Owners */}
                {user && user.id === devo.user_id && (
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(devo)}
                      className="p-2 bg-brand-primary/10 text-brand-primary rounded-full hover:bg-brand-primary hover:text-white transition-colors"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(devo.id)}
                      className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">delete</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <img src={devo.userAvatar} className="w-10 h-10 rounded-xl object-cover border border-brand-primary/20" alt="" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-brand-obsidian dark:text-brand-silk leading-none">{devo.userName}</span>
                      <span className="text-[9px] text-brand-obsidian/30 dark:text-white/30 font-black uppercase mt-1">
                        {new Date(devo.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-brand-primary/20">
                    {devo.bibleVerse || devo.bible_verse}
                  </div>
                </div>

                <h3 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white mb-4 leading-tight group-hover:text-brand-primary transition-colors">{devo.title}</h3>
                <p className="text-lg text-brand-obsidian/70 dark:text-brand-silk/80 font-light italic leading-relaxed line-clamp-4">"{devo.content}"</p>

                {devo.audioUrl && (
                  <button
                    onClick={() => handlePlayAudio(devo.id, devo.audioUrl!)}
                    className={`mt-8 w-full flex items-center gap-5 p-5 rounded-[2rem] border transition-all ${playingId === devo.id
                      ? 'bg-brand-primary border-brand-primary text-brand-obsidian shadow-lg scale-[1.02]'
                      : 'bg-brand-silk dark:bg-brand-obsidian/40 border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5'
                      }`}
                  >
                    <span className="material-symbols-outlined text-3xl fill-1">
                      {playingId === devo.id ? 'pause' : 'play_arrow'}
                    </span>
                    <div className="flex flex-col items-start w-full">
                      <div className="flex justify-between w-full">
                        <span className="text-[9px] font-black uppercase tracking-widest">{playingId === devo.id ? 'Escuchando...' : 'Escuchar Devocional'}</span>
                        {devo.duration && (
                          <span className="text-[9px] font-bold opacity-60">{devo.duration}</span>
                        )}
                      </div>
                      <span className={`text-[8px] font-bold mt-0.5 ${playingId === devo.id ? 'text-brand-obsidian/60' : 'text-brand-obsidian/40 dark:text-white/40'}`}>
                        (+10 Puntos de Impacto al finalizar)
                      </span>
                    </div>
                  </button>
                )}
              </article>
            )))}
        </div>
      </div>

      {view === 'create' && createPortal(
        <div className="fixed inset-0 z-[5000] bg-brand-silk dark:bg-brand-obsidian flex flex-col pt-safe-top pb-safe-bottom animate-in fade-in duration-300">

          {/* Header de Creación */}
          <div className="h-24 px-6 flex items-center justify-between border-b border-brand-obsidian/5 dark:border-white/10 bg-brand-silk/90 dark:bg-brand-obsidian/90 backdrop-blur-3xl z-50 shrink-0">
            <button
              onClick={() => { setView('feed'); resetForm(); }}
              className="w-12 h-12 rounded-2xl bg-brand-obsidian/5 dark:bg-white/10 flex items-center justify-center text-brand-obsidian/40 dark:text-white/60 active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em] hidden md:block">
              {editingId ? 'Editar Reflexión' : 'Nuevo Encuentro'}
            </h4>
            <button
              onClick={handleSave}
              disabled={!title || (!content && !audioBlob && !editingId)}
              className="bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl disabled:opacity-20 active:scale-95 transition-all"
            >
              {editingId ? 'Actualizar' : 'Publicar'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto w-full px-6 py-8 flex flex-col gap-8 max-w-4xl mx-auto">
            {/* Campos de Entrada */}
            <div className="space-y-6">
              <input
                autoFocus
                placeholder="Título de tu encuentro..."
                className="w-full text-4xl md:text-5xl font-serif font-bold bg-transparent border-none focus:ring-0 text-brand-obsidian dark:text-white placeholder:text-brand-obsidian/10 dark:placeholder:text-white/20 tracking-tighter p-0"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="flex items-center gap-4 bg-brand-primary/[0.08] dark:bg-brand-primary/10 px-4 py-3 rounded-xl border border-brand-primary/30 w-full md:w-fit">
                <span className="material-symbols-outlined text-brand-primary text-xl font-black shrink-0">menu_book</span>
                <input
                  placeholder="Pasaje clave (Ej: Salmos 23)"
                  className="w-full md:w-72 text-sm font-black bg-transparent border-none focus:ring-0 text-brand-primary placeholder:text-brand-primary/40 uppercase tracking-widest p-0"
                  value={verse}
                  onChange={(e) => setVerse(e.target.value)}
                />
              </div>
            </div>

            <textarea
              placeholder="Escribe lo que el Espíritu pone hoy en tu corazón..."
              className="w-full flex-1 bg-transparent border-none focus:ring-0 text-xl font-light text-brand-obsidian/80 dark:text-brand-silk leading-relaxed italic resize-none placeholder:text-brand-obsidian/10 dark:placeholder:text-white/10 p-0 min-h-[300px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>

            <div className="h-32"></div>

            {/* Recorder (Only for new posts or if we decide to allow adding audio to existing) 
                For MVP simplistic, hide recorder if editing to avoid complexity of replacing audio file logic 
            */}
            {!editingId && (
              <div className="fixed bottom-8 left-0 right-0 flex justify-center px-6 z-[700] pointer-events-none pb-[env(safe-area-inset-bottom)]">
                <div className="bg-white/95 dark:bg-brand-surface/95 backdrop-blur-2xl border-2 border-brand-obsidian/5 dark:border-white/10 p-4 rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.4)] pointer-events-auto flex items-center gap-4 min-w-[280px]">

                  {isRecording ? (
                    <div className="flex items-center gap-4 w-full px-2">
                      <div className="flex items-center gap-2 bg-red-600/10 dark:bg-red-500/20 px-4 py-2 rounded-full border border-red-500/30">
                        <div className="w-2.5 h-2.5 bg-red-600 dark:bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_#ef4444]"></div>
                        <span className="text-xl font-outfit font-black text-red-600 dark:text-red-500 tabular-nums leading-none">{formatTime(recordingDuration)}</span>
                      </div>
                      <button
                        onClick={stopRecording}
                        className="w-14 h-14 rounded-full bg-red-600 dark:bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all border-4 border-white dark:border-brand-obsidian ml-auto"
                      >
                        <span className="material-symbols-outlined text-3xl fill-1">stop</span>
                      </button>
                    </div>
                  ) : audioBlob ? (
                    <div className="flex items-center gap-4 w-full px-2">
                      <div className="flex-1 bg-brand-silk/50 dark:bg-brand-obsidian/40 rounded-full px-3 py-1.5 border border-brand-primary/20 flex items-center">
                        <audio controls src={audioBlob} className="w-full h-8 accent-brand-primary" />
                      </div>
                      <button
                        onClick={() => setAudioBlob(null)}
                        className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shrink-0"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 px-2 w-full">
                      <button
                        onClick={startRecording}
                        className="w-14 h-14 rounded-full bg-brand-obsidian dark:bg-brand-primary text-brand-primary dark:text-brand-obsidian flex items-center justify-center shadow-lg active:scale-90 transition-all border-4 border-brand-silk dark:border-brand-obsidian"
                      >
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
