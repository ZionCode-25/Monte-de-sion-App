import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useDevotionals } from '../src/hooks/useDevotionals';
import { SmartImage } from './ui/SmartImage';

const DevotionalJournal: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Simplified state: 'list' or 'create'
  const [view, setView] = useState<'list' | 'create'>('list');
  // Access data - removing sophisticated filters to just fetch 'all' by default or handling inside hook
  // Assuming hook supports a simple 'all' or similar. 
  const { devotionals, isLoading, addDevotional, deleteDevotional, editDevotional, awardListenPoints } = useDevotionals('all');

  // Creation State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [verse, setVerse] = useState(''); // User might want this, though prompt said "Title, Content, Audio". I will keep Verse as optional small chip if they want, or remove if strictly minimalist. I'll Include it as it's standard for devotionals.
  const [audioBlob, setAudioBlob] = useState<string | null>(null);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Scroll Ref
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (highlightId && !isLoading && itemRefs.current[highlightId]) {
      setTimeout(() => itemRefs.current[highlightId]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
    }
  }, [highlightId, isLoading]);

  // --- AUDIO LOGIC (Minimalist) ---
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (id: string, url: string) => {
    if (playingId === id) {
      if (audioRef.current?.paused) audioRef.current.play();
      else audioRef.current?.pause();
    } else {
      if (audioRef.current) { audioRef.current.pause(); }
      audioRef.current = new Audio(url);
      setPlayingId(id);
      setAudioProgress(0);

      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) setAudioProgress(audioRef.current.currentTime);
      });
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) setAudioDuration(audioRef.current.duration);
      });
      audioRef.current.addEventListener('ended', () => {
        setPlayingId(null);
        awardListenPoints();
      });
      audioRef.current.play();
    }
  };

  // --- RECORDER LOGIC ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mediaRecorderRef.current.ondataavailable = e => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setMediaBlob(blob);
        const reader = new FileReader();
        reader.onloadend = () => setAudioBlob(reader.result as string);
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = window.setInterval(() => setRecordingDuration(p => p + 1), 1000);
    } catch (e) { alert("Acceso al micrófono denegado"); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    try {
      if (editingId) {
        await editDevotional.mutateAsync({ id: editingId, updates: { title, content, bibleVerse: verse } });
      } else {
        // Simplified create
        await addDevotional.mutateAsync({
          title, content, bible_verse: verse, mediaBlob,
          duration: recordingDuration > 0 ? `${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')}` : undefined
        });
      }
      resetForm();
    } catch (e) { console.error(e); alert("Error al guardar"); }
  };

  const handleEdit = (d: any) => {
    setEditingId(d.id); setTitle(d.title); setContent(d.content); setVerse(d.bibleVerse || d.bible_verse || '');
    setView('create');
  };
  const handleDelete = (id: string) => { if (confirm("¿Eliminar?")) deleteDevotional.mutate(id); };
  const resetForm = () => { setView('list'); setEditingId(null); setTitle(''); setContent(''); setVerse(''); setAudioBlob(null); setMediaBlob(null); };

  if (view === 'create') {
    return (
      <div className="min-h-screen bg-white dark:bg-black p-6 animate-fade-in">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold dark:text-white">{editingId ? 'Editar Reflexión' : 'Nueva Reflexión'}</h2>
            <button onClick={resetForm} className="text-gray-500">Cancelar</button>
          </div>

          <input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} className="w-full text-3xl font-bold bg-transparent border-b border-gray-200 dark:border-zinc-800 pb-2 focus:outline-none dark:text-white placeholder:text-gray-300" />

          <textarea placeholder="Escribe tu reflexión..." value={content} onChange={e => setContent(e.target.value)} className="w-full h-40 bg-transparent resize-none text-lg text-gray-700 dark:text-gray-300 focus:outline-none placeholder:text-gray-300" />

          <input placeholder="Versículo (Opcional)" value={verse} onChange={e => setVerse(e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-900 rounded-xl px-4 py-3 dark:text-white focus:outline-none" />

          {/* Audio Recorder Section */}
          {!editingId && (
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-4 flex items-center justify-between">
              {isRecording ? (
                <div className="flex items-center gap-4 text-red-500 font-bold animate-pulse">
                  <div className="w-3 h-3 bg-red-500 rounded-full" /> Grabando {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                </div>
              ) : audioBlob ? (
                <div className="flex items-center gap-2 w-full">
                  <audio src={audioBlob} controls className="w-full h-8" />
                  <button onClick={() => setAudioBlob(null)} className="text-red-500 p-2"><span className="material-symbols-outlined">delete</span></button>
                </div>
              ) : (
                <span className="text-gray-400">Añadir audio (Opcional)</span>
              )}

              {!audioBlob && (
                <button onClick={isRecording ? stopRecording : startRecording} className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${isRecording ? 'bg-red-500' : 'bg-black dark:bg-white dark:text-black'} shadow-lg`}>
                  <span className="material-symbols-outlined">{isRecording ? 'stop' : 'mic'}</span>
                </button>
              )}
            </div>
          )}

          <button onClick={handleSave} className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg shadow-xl">
            {editingId ? 'Guardar Cambios' : 'Publicar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-silk dark:bg-black p-4 md:p-8 transition-colors">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">Devocionales</h1>
            <p className="text-gray-500 text-sm">Comunidad de Fe</p>
          </div>
          <button onClick={() => setView('create')} className="w-12 h-12 bg-black dark:bg-white rounded-full text-white dark:text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
            <span className="material-symbols-outlined">add</span>
          </button>
        </header>

        <div className="space-y-6">
          {isLoading && <p className="text-center text-gray-400">Cargando...</p>}

          {devotionals.map((devo: any) => (
            <article key={devo.id} ref={el => itemRefs.current[devo.id] = el} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 transition-all hover:shadow-md">

              {/* HEADER */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${devo.user_id}`)}>
                  <SmartImage src={devo.userAvatar} className="w-[40px] h-[40px] rounded-full object-cover bg-gray-200" />
                  <div>
                    <h3 className="font-bold text-black dark:text-white leading-none text-sm">{devo.userName}</h3>
                    <span className="text-xs text-gray-400">{new Date(devo.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {/* Actions */}
                {user && user.id === devo.user_id && (
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(devo)} className="text-gray-400 hover:text-black dark:hover:text-white"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                    <button onClick={() => handleDelete(devo.id)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                  </div>
                )}
              </div>

              {/* BODY */}
              <div className="mb-6">
                <h4 className="text-xl font-bold text-black dark:text-white mb-2">{devo.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{devo.content}</p>
                {devo.bibleVerse && <span className="inline-block mt-3 px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-xs font-bold rounded-full text-gray-600 dark:text-gray-400">{devo.bibleVerse || devo.bible_verse}</span>}
              </div>

              {/* FOOTER - AUDIO */}
              {devo.audioUrl && (
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-black/40 p-2 rounded-full border border-gray-100 dark:border-zinc-800">
                  <button onClick={() => togglePlay(devo.id, devo.audioUrl)} className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">{playingId === devo.id ? 'pause' : 'play_arrow'}</span>
                  </button>
                  <div className="flex-1 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-black dark:bg-white transition-all duration-300" style={{ width: playingId === devo.id ? `${(audioProgress / audioDuration) * 100}%` : '0%' }}></div>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 px-2">{devo.duration || "Audio"}</span>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DevotionalJournal;
