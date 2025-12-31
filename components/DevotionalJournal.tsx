import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useDevotionals } from '../src/hooks/useDevotionals';
import { SmartImage } from './ui/SmartImage';

const DevotionalJournal: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'create'>('list');
  const { devotionals, isLoading, addDevotional, deleteDevotional, editDevotional, awardListenPoints } = useDevotionals('all');

  // CREATE STATE
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audioBlob, setAudioBlob] = useState<string | null>(null);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  // AUDIO PLAYBACK
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // SCROLL REF
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (highlightId && !isLoading && itemRefs.current[highlightId]) {
      setTimeout(() => itemRefs.current[highlightId]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
    }
  }, [highlightId, isLoading]);

  // HANDLERS
  const togglePlay = (id: string, url: string) => {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setPlayingId(id);
      audioRef.current.onended = () => {
        setPlayingId(null);
        awardListenPoints();
      };
    }
  };

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
    } catch (e) { alert("Micrófono bloqueado"); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    await addDevotional.mutateAsync({
      title, content, mediaBlob,
      duration: recordingDuration > 0 ? `${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')}` : undefined
    });
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Borrar?")) deleteDevotional.mutate(id);
  };

  const resetForm = () => {
    setView('list'); setTitle(''); setContent(''); setAudioBlob(null); setMediaBlob(null);
  };

  if (view === 'create') {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Nuevo Devocional</h2>
            <button onClick={resetForm} className="text-gray-500">Cancelar</button>
          </div>
          <input className="w-full text-2xl font-bold mb-4 border-b focus:outline-none" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea className="w-full h-40 resize-none text-lg mb-4 focus:outline-none text-gray-700" placeholder="Escribe aquí..." value={content} onChange={e => setContent(e.target.value)} />

          {/* Simple Recorder */}
          <div className="bg-gray-100 p-4 rounded-xl flex items-center justify-between mb-6">
            {audioBlob ? <audio controls src={audioBlob} className="h-8 w-full" /> : (
              <div className="flex items-center gap-2">
                <button onClick={isRecording ? stopRecording : startRecording} className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${isRecording ? 'bg-red-500' : 'bg-black'}`}>
                  <span className="material-symbols-outlined">{isRecording ? 'stop' : 'mic'}</span>
                </button>
                <span className="text-sm text-gray-500">{isRecording ? 'Grabando...' : 'Grabar Audio'}</span>
              </div>
            )}
          </div>

          <button onClick={handleSave} className="w-full bg-black text-white py-3 rounded-xl font-bold">Publicar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Devocionales</h1>
          <button onClick={() => setView('create')} className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined">add</span>
          </button>
        </header>

        <div>
          {isLoading && <p className="text-center text-gray-400">Cargando...</p>}

          {devotionals.map((devo: any) => (
            <div
              key={devo.id}
              ref={el => itemRefs.current[devo.id] = el}
              className="bg-white rounded-xl shadow-sm p-4 mb-4 relative" // CARD CONTAINER STANDARD
            >
              {/* ACTIONS: DELETE (Owner Only) */}
              {user && user.id === devo.user_id && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(devo.id); }}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              )}

              {/* HEADER */}
              <div className="flex items-center mb-3">
                {/* AVATAR: STRICT 40PX */}
                <img
                  src={devo.userAvatar || 'https://via.placeholder.com/40'}
                  alt="Avatar"
                  className="object-cover rounded-full"
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                  onClick={() => navigate(`/profile/${devo.user_id}`)}
                />
                <div className="ml-3">
                  <p className="text-sm font-bold text-gray-900 leading-tight cursor-pointer" onClick={() => navigate(`/profile/${devo.user_id}`)}>
                    {devo.userName || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(devo.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* BODY */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{devo.title}</h3>
                <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">{devo.content}</p>
              </div>

              {/* AUDIO PLAYER (Minimalist) */}
              {devo.audioUrl && (
                <div className="mt-3 bg-gray-100 rounded-lg p-2 flex items-center">
                  <button
                    onClick={() => togglePlay(devo.id, devo.audioUrl)}
                    className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shrink-0 mr-3"
                  >
                    <span className="material-symbols-outlined text-lg">{playingId === devo.id ? 'pause' : 'play_arrow'}</span>
                  </button>
                  <div className="flex-1 h-1 bg-gray-300 rounded-full overflow-hidden">
                    <div className={`h-full bg-black ${playingId === devo.id ? 'animate-pulse' : ''}`} style={{ width: playingId === devo.id ? '100%' : '0%' }}></div>
                  </div>
                  <span className="text-xs font-mono text-gray-500 ml-3">{devo.duration || 'Audio'}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DevotionalJournal;
