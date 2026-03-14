import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import { useDevotionals } from '../hooks/useDevotionals';
import { useReportContent } from '../hooks/useReports';
import { SmartImage } from '../components/ui/SmartImage';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import DOMPurify from 'dompurify';

const DevotionalJournal: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'create'>('list');
  const { devotionals, isLoading, addDevotional, deleteDevotional, editDevotional, awardListenPoints } = useDevotionals('all');
  const reportContent = useReportContent();

  // CREATE STATE
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [verse, setVerse] = useState('');
  const [audioBlob, setAudioBlob] = useState<string | null>(null);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  // EDIT STATE
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // RICH TEXT EDITOR (TipTap)
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[300px] p-4 text-xl font-medium leading-relaxed text-gray-600 dark:text-gray-300 focus:outline-none prose prose-lg max-w-none dark:prose-invert',
      },
    },
  });

  // AUDIO PLAYBACK
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // MENU STATE
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // SCROLL REF
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

  // AUDIO HANDLERS
  const [awardedIds, setAwardedIds] = useState<Set<string>>(new Set());

  const togglePlay = (id: string, url: string) => {
    if (playingId === id) {
      if (audioRef.current?.paused) {
        audioRef.current.play();
      } else {
        audioRef.current?.pause();
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current = new Audio(url);
      setPlayingId(id);
      setProgress(0);

      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          const currentProgress = audioRef.current.currentTime;
          const currentDuration = audioRef.current.duration;
          setProgress(currentProgress);

          // Smart award: 80% and not yet awarded in this session
          if (currentDuration > 0 && (currentProgress / currentDuration) >= 0.8 && !awardedIds.has(id)) {
            setAwardedIds(prev => new Set(prev).add(id));
            awardListenPoints();
          }
        }
      });
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
      });
      audioRef.current.addEventListener('ended', () => {
        setPlayingId(null);
        setProgress(0);
      });
      audioRef.current.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = time;
    setProgress(time);
  };

  const formatTime = (s: number) => {
    if (!s) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // RECORDER
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Select best supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

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

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => setRecordingDuration(p => p + 1), 1000);
    } catch (e) {
      console.error("Recording error:", e);
      alert("Error al acceder al micrófono. Por favor, asegúrate de dar los permisos necesarios.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // CRUD
  const handleSave = async () => {
    if (!title.trim() || !content.trim() || isSaving) return;
    try {
      setIsSaving(true);
      if (editingId) {
        await editDevotional.mutateAsync({ id: editingId, updates: { title, content, bibleVerse: verse } });
      } else {
        await addDevotional.mutateAsync({
          title, content, bible_verse: verse, mediaBlob,
          duration: recordingDuration > 0 ? formatTime(recordingDuration) : undefined
        });
      }
      resetForm();
    } catch (e) {
      alert("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (devo: any) => {
    setEditingId(devo.id);
    setTitle(devo.title);
    setContent(devo.content);
    setVerse(devo.bibleVerse || devo.bible_verse || '');
    setView('create');
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta entrada?")) deleteDevotional.mutate(id);
  };

  const handleReport = (id: string) => {
    if (confirm('¿Deseas reportar este devocional como inapropiado?')) {
      reportContent.mutate(
        { contentType: 'devotional', contentId: id },
        {
          onSuccess: () => alert('Devocional reportado. Gracias por ayudarnos.'),
          onError: (err: any) => {
            if (err.message === 'Ya reportaste este contenido') {
              alert('Ya has reportado este devocional.');
            } else {
              alert('Error al reportar.');
            }
          }
        }
      );
    }
  };

  const resetForm = () => {
    setView('list'); setEditingId(null); setTitle(''); setContent(''); setVerse(''); setAudioBlob(null); setMediaBlob(null);
    editor?.commands.clearContent();
  };

  if (view === 'create') {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-black flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-300">
        <div className="px-6 py-8 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-white/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 z-50">
          <button onClick={resetForm} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="text-sm font-black uppercase tracking-widest text-brand-primary">
            {editingId ? 'Editar Reflexión' : 'Nueva Entrada'}
          </h2>
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim() || !content.trim()}
            className="bg-brand-primary text-brand-obsidian dark:bg-brand-primary dark:text-brand-obsidian px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg hover:transform hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
            {editingId ? 'Guardar' : 'Publicar'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 max-w-3xl mx-auto w-full">
          <input
            className="w-full text-4xl md:text-5xl font-serif font-bold bg-transparent border-none focus:ring-0 placeholder:text-gray-200 dark:placeholder:text-zinc-800 text-brand-obsidian dark:text-white mb-6 p-0 leading-tight"
            placeholder="Título de hoy..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />

          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-brand-primary">menu_book</span>
            <input
              className="bg-brand-primary/5 dark:bg-white/5 rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-widest text-brand-primary placeholder:text-brand-primary/40 focus:outline-none w-full md:w-auto"
              placeholder="Pasaje (Ej: Salmos 23)"
              value={verse}
              onChange={e => setVerse(e.target.value)}
            />
          </div>

          {/* Rich Text Editor (TipTap) */}
          <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white/50 dark:bg-black/20 overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-3 border-b border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/5">
              {[
                { label: 'B', action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive('bold'), title: 'Negrita' },
                { label: 'I', action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive('italic'), title: 'Cursiva' },
                { label: 'S', action: () => editor?.chain().focus().toggleStrike().run(), active: editor?.isActive('strike'), title: 'Tachado' },
              ].map(btn => (
                <button
                  key={btn.title}
                  type="button"
                  title={btn.title}
                  onClick={btn.action}
                  className={`w-8 h-8 rounded-lg text-sm font-black transition-all ${
                    btn.active
                      ? 'bg-brand-primary text-brand-obsidian shadow-sm'
                      : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
              <div className="w-px bg-gray-200 dark:bg-white/10 mx-1" />
              {[
                { label: 'H1', action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), active: editor?.isActive('heading', { level: 1 }), title: 'Título grande' },
                { label: 'H2', action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive('heading', { level: 2 }), title: 'Subtítulo' },
              ].map(btn => (
                <button
                  key={btn.title}
                  type="button"
                  title={btn.title}
                  onClick={btn.action}
                  className={`px-2 h-8 rounded-lg text-xs font-black transition-all ${
                    btn.active
                      ? 'bg-brand-primary text-brand-obsidian shadow-sm'
                      : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
              <div className="w-px bg-gray-200 dark:bg-white/10 mx-1" />
              <button
                type="button"
                title="Cita"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={`px-2 h-8 rounded-lg text-xs font-black transition-all ${
                  editor?.isActive('blockquote')
                    ? 'bg-brand-primary text-brand-obsidian shadow-sm'
                    : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                ❝
              </button>
            </div>
            {/* Editor Area */}
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Recorder Bar */}
        {!editingId && (
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
        )}
      </div>,
      document.body
    );
  }

  return (
    <div className="min-h-screen bg-brand-silk dark:bg-brand-obsidian transition-colors animate-reveal">

      {/* Dashboard Header Style */}
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-40">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse shadow-[0_0_10px_#ffb700]"></div>
            <span className="text-brand-obsidian/60 dark:text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Devocional Diario</span>
          </div>
          <div className="flex items-end justify-between">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tight leading-[0.9]">
              Bitácora <br /> <span className="text-brand-obsidian/80 dark:text-white/80 italic">de Gracia</span>
            </h1>
            <button
              onClick={() => setView('create')}
              className="w-14 h-14 bg-brand-obsidian dark:bg-white rounded-[1.5rem] flex items-center justify-center text-white dark:text-black shadow-2xl hover:scale-105 active:scale-95 transition-all group"
            >
              <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">add</span>
            </button>
          </div>
        </header>

        <div className="space-y-6">
          {isLoading && (
            <div className="py-20 text-center text-brand-obsidian/30 dark:text-white/30 font-serif italic text-xl">
              Cargando reflexiones...
            </div>
          )}

          {devotionals.map((devo: any) => {
            const isPlaying = playingId === devo.id;

            return (
              <article
                key={devo.id}
                ref={(el) => { itemRefs.current[devo.id] = el as HTMLDivElement; }}
                className="bg-white dark:bg-brand-surface rounded-[2rem] p-6 md:p-10 shadow-lg border border-brand-obsidian/5 dark:border-white/5 relative group transition-all hover:shadow-2xl hover:scale-[1.01]"
              >
                {/* DECORATIVE QUOTE */}
                <span className="font-serif text-[120px] absolute -top-4 right-8 text-brand-primary/10 dark:text-white/5 pointer-events-none select-none">
                  “
                </span>
                {/* MENU KONTEXT - Absolute Top Right */}
                {user && (
                  <div className="absolute top-6 right-6 z-20">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === devo.id ? null : devo.id); }}
                      className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors"
                    >
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>

                    {openMenuId === devo.id && (
                      <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 animate-in zoom-in-95 duration-200 origin-top-right">
                        {user.id !== devo.user_id && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); handleReport(devo.id); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">flag</span> Reportar
                          </button>
                        )}
                        {user.id === devo.user_id && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(devo); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span> Editar
                          </button>
                        )}
                        {(user.id === devo.user_id || user.role === 'SUPER_ADMIN') && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(devo.id); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span> Eliminar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* HEADER */}
                <div className="flex items-center gap-4 mb-8 cursor-pointer group/profile relative z-10" onClick={() => navigate(`/profile/${devo.user_id}`)}>
                  <div className="relative">
                    <SmartImage
                      src={devo.userAvatar}
                      className="rounded-full object-cover border-2 border-brand-primary/20 dark:border-white/10 p-[2px]"
                      style={{ width: '48px', height: '48px' }}
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-brand-obsidian dark:text-white leading-none group-hover/profile:text-brand-primary transition-all">
                      {devo.userName || 'Usuario'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {new Date(devo.created_at).toLocaleDateString()}
                      </span>
                      {devo.bibleVerse && (
                        <span className="text-[9px] font-black text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {devo.bibleVerse}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ULTRA PLAYER TOP */}
                {devo.audioUrl && (
                  <div className={`
                    mb-8 rounded-[1.5rem] p-4 flex items-center gap-4 transition-all duration-500 relative z-10
                    ${isPlaying
                      ? 'bg-gradient-to-r from-brand-obsidian to-zinc-800 dark:from-white dark:to-gray-200 text-brand-primary dark:text-brand-obsidian shadow-2xl scale-[1.02]'
                      : 'bg-gray-50 dark:bg-white/5 text-brand-obsidian dark:text-white border border-gray-100 dark:border-white/10'
                    }
                  `}>
                    <button
                      onClick={() => togglePlay(devo.id, devo.audioUrl)}
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90
                        ${isPlaying ? 'bg-brand-primary text-brand-obsidian shadow-[0_0_15px_rgba(255,183,0,0.5)]' : 'bg-white dark:bg-black/20 text-brand-obsidian dark:text-white shadow-sm'}
                      `}
                    >
                      <span className="material-symbols-outlined fill-1 text-2xl">
                        {isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>

                    <div className="flex-1 flex flex-col justify-center gap-1.5">
                      <div className="flex justify-between items-end text-[10px] font-mono font-bold uppercase tracking-widest opacity-80">
                        <span className={isPlaying ? 'text-white dark:text-brand-obsidian' : ''}>{isPlaying ? formatTime(progress) : 'Reflexión en Audio'}</span>
                        <span className={isPlaying ? 'text-white/60 dark:text-brand-obsidian/60' : ''}>{isPlaying ? formatTime(duration) : (devo.duration || '0:00')}</span>
                      </div>

                      <div className="h-1.5 w-full bg-current/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-100 ease-linear rounded-full ${isPlaying ? 'bg-brand-primary dark:bg-brand-primary' : 'bg-brand-primary/60 dark:bg-white/40'}`}
                          style={{ width: isPlaying ? `${(progress / duration) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* BODY */}
                <div className="mb-2 relative z-10">
                  <h2 className="text-3xl font-serif font-black text-brand-obsidian dark:text-white mb-6 leading-tight">
                    {devo.title}
                  </h2>
                  <div 
                    className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium 
                               [&_p]:mb-4 [&_strong]:text-brand-obsidian dark:[&_strong]:text-white [&_strong]:font-black 
                               [&_em]:font-serif [&_em]:italic [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2
                               [&_blockquote]:border-l-4 [&_blockquote]:border-brand-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(devo.content) }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DevotionalJournal;
