import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { usePrayerRequests, PrayerRequest } from '../src/hooks/usePrayerRequests';
import { PrayerCategory } from '../types';
import InteractionListModal from './InteractionListModal';
import { SmartImage } from './ui/SmartImage';

interface Props {
  onBack: () => void;
}

const PrayerRequests: React.FC<Props> = ({ onBack }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');

  // States
  const [activeTab, setActiveTab] = useState<'create' | 'wall' | 'mine'>('wall');

  // Refs
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Interaction Overlays
  const [interactionsModalRequest, setInteractionsModalRequest] = useState<PrayerRequest | null>(null);

  const fetchFilter = activeTab === 'mine' ? 'mine' : 'all';
  const {
    requests,
    addRequest,
    deleteRequest,
    editRequest,
    toggleInteraction,
    isLoading
  } = usePrayerRequests(fetchFilter);

  // Form State
  const [requestContent, setRequestContent] = useState('');
  const [category, setCategory] = useState<PrayerCategory>('Espiritual');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PrayerRequest | null>(null);

  const categories: PrayerCategory[] = ['Salud', 'Familia', 'Finanzas', 'Gratitud', 'Espiritual', 'Otro'];

  // Scroll to highlighted item on load
  useEffect(() => {
    if (highlightId && requests.length > 0 && itemRefs.current[highlightId]) {
      setTimeout(() => {
        itemRefs.current[highlightId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [highlightId, requests]);

  const resetForm = () => {
    setRequestContent('');
    setCategory('Espiritual');
    setIsPrivate(false);
    setIsSent(false);
    setEditingRequest(null);
  };

  const handleProfileClick = (targetUserId?: string) => {
    if (targetUserId) navigate(`/profile/${targetUserId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-silk dark:bg-brand-obsidian animate-reveal">

      {/* --- HEADER --- */}
      <header className="px-8 pt-12 pb-8 sticky top-0 bg-brand-silk/80 dark:bg-brand-obsidian/80 backdrop-blur-3xl z-[120] border-b border-brand-obsidian/5 dark:border-white/5">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Altar Digital</span>
            </div>
            <h2 className="text-5xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tighter leading-none">
              Peticiones <br /><span className="gold-text-gradient italic">de Fe</span>
            </h2>
          </div>
          <button
            onClick={onBack}
            className="w-14 h-14 bg-white dark:bg-brand-surface rounded-2xl border border-brand-obsidian/5 dark:border-white/10 flex items-center justify-center text-brand-obsidian dark:text-white active:scale-90 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
        </div>

        <div className="flex gap-2 bg-brand-obsidian/[0.03] dark:bg-white/[0.03] p-1.5 rounded-2xl border border-brand-obsidian/5 dark:border-white/5 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('wall'); resetForm(); }}
            className={`flex-1 py-3.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'wall' ? 'bg-white dark:bg-brand-surface text-brand-obsidian dark:text-brand-primary shadow-sm' : 'text-brand-obsidian/40 dark:text-white/30'}`}
          >
            Muro Público
          </button>
          <button
            onClick={() => { setActiveTab('mine'); resetForm(); }}
            className={`flex-1 py-3.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'mine' ? 'bg-white dark:bg-brand-surface text-brand-obsidian dark:text-brand-primary shadow-sm' : 'text-brand-obsidian/40 dark:text-white/30'}`}
          >
            Mis Peticiones
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'create' ? 'bg-brand-primary text-brand-obsidian shadow-sm' : 'text-brand-obsidian/40 dark:text-white/30'}`}
          >
            {editingRequest ? 'Editar Clamor' : 'Nuevo Clamor'}
          </button>
        </div>
      </header>

      {/* --- CONTENT --- */}
      <main className="flex-1 px-8 pt-10 pb-44 max-w-2xl mx-auto w-full">

        {activeTab === 'create' ? (
          <div className="animate-reveal">
            {isSent ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-8 shadow-2xl">
                  <span className="material-symbols-outlined text-5xl">done_all</span>
                </div>
                <h3 className="text-3xl font-serif font-bold text-brand-obsidian dark:text-white mb-4 italic">
                  Tu clamor ha sido escuchado
                </h3>
                <p className="text-brand-obsidian/60 dark:text-white/60 mb-8 max-w-xs mx-auto text-sm">
                  La comunidad se unirá en fe contigo.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => { setIsSent(false); setActiveTab('wall'); }}
                    className="px-8 py-3 bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                  >
                    Ir al Muro
                  </button>
                  <button
                    onClick={() => { setIsSent(false); setRequestContent(''); setCategory('Espiritual'); }}
                    className="px-8 py-3 bg-brand-obsidian/5 dark:bg-white/10 text-brand-obsidian dark:text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-obsidian/10 dark:hover:bg-white/20 transition-all"
                  >
                    Nuevo Clamor
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-brand-surface p-8 rounded-[2.5rem] shadow-xl border border-brand-obsidian/5 dark:border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary via-purple-500 to-indigo-500"></div>

                <div className="mb-8">
                  <label className="text-[10px] font-black pointer-events-none text-brand-obsidian/40 dark:text-white/40 uppercase tracking-[0.2em] mb-3 block ml-1">
                    Motivo de Oración
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${category === cat
                          ? 'bg-brand-primary text-brand-obsidian border-brand-primary shadow-lg scale-105'
                          : 'bg-brand-obsidian/[0.02] dark:bg-white/5 border-transparent text-brand-obsidian/60 dark:text-white/60 hover:border-brand-obsidian/10 dark:hover:border-white/10'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6 relative">
                  <textarea
                    autoFocus
                    value={requestContent}
                    onChange={(e) => setRequestContent(e.target.value)}
                    placeholder="Escribe tu petición aquí..."
                    className="w-full bg-brand-obsidian/[0.02] dark:bg-white/[0.03] border-2 border-brand-obsidian/5 dark:border-white/5 rounded-3xl p-6 text-lg text-brand-obsidian dark:text-white placeholder:text-brand-obsidian/20 dark:placeholder:text-white/20 focus:ring-0 focus:border-brand-primary/50 transition-all resize-none min-h-[200px] font-medium leading-relaxed"
                  />
                  <div className="absolute bottom-4 right-4 text-[10px] font-black text-brand-obsidian/20 dark:text-white/20 pointer-events-none">
                    {requestContent.length}/500
                  </div>
                </div>

                <div className="flex items-center justify-between mb-8 px-2">
                  <label className="flex items-center gap-3 cursor-pointer group/privacy">
                    <div className={`w-12 h-7 rounded-full transition-colors relative ${isPrivate ? 'bg-brand-obsidian dark:bg-white' : 'bg-brand-obsidian/10 dark:bg-white/10'}`}>
                      <input type="checkbox" className="hidden" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white dark:bg-brand-obsidian rounded-full shadow-md transition-transform ${isPrivate ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-obsidian/60 dark:text-white/60 group-hover/privacy:text-brand-obsidian dark:group-hover/privacy:text-white transition-colors">
                      {isPrivate ? 'Privado (Solo Pastores)' : 'Público (Muro)'}
                    </span>
                  </label>
                </div>

                <button
                  onClick={async () => {
                    if (!requestContent.trim()) return;
                    try {
                      if (editingRequest) {
                        await editRequest.mutateAsync({
                          id: editingRequest.id,
                          updates: {
                            content: requestContent,
                            category,
                            is_private: isPrivate
                          }
                        });
                        setEditingRequest(null);
                      } else {
                        await addRequest.mutateAsync({
                          content: requestContent,
                          category,
                          is_private: isPrivate
                        });
                      }
                      setIsSent(true);
                    } catch (error) {
                      console.error(error);
                      alert("Error al enviar");
                    }
                  }}
                  disabled={!requestContent.trim() || (!editingRequest && addRequest.isPending)}
                  className="w-full bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-2xl"
                >
                  {editingRequest ? 'Actualizar Petición' : 'Enviar Petición'}
                </button>

              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-reveal">
            {activeTab === 'mine' && (
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20">
                  <span className="material-symbols-outlined text-brand-primary text-sm">lock</span>
                  <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest">Tus Oraciones son visibles para ti</p>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white dark:bg-brand-surface h-48 rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-20 opacity-40">
                <span className="material-symbols-outlined text-6xl mb-4 text-brand-obsidian dark:text-white">volunteer_activism</span>
                <p className="text-brand-obsidian dark:text-white font-serif italic text-lg">No hay peticiones aún.</p>
              </div>
            ) : (
              requests.map((req) => (
                <article
                  key={req.id}
                  ref={el => itemRefs.current[req.id] = el}
                  className={`bg-white dark:bg-brand-surface p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-brand-obsidian/5 dark:border-white/5 relative group ${highlightId === req.id ? 'ring-2 ring-brand-primary' : ''}`}
                >

                  {/* EDIT/DELETE ACTIONS (Only Author - Always Visible on Hover) */}
                  {user && user.id === req.user_id && (
                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={() => {
                          setEditingRequest(req);
                          setRequestContent(req.content);
                          setCategory(req.category as PrayerCategory);
                          setIsPrivate(req.is_private || false);
                          setActiveTab('create');
                        }}
                        className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center hover:bg-brand-primary hover:text-white transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('¿Eliminar esta petición?')) deleteRequest.mutate(req.id);
                        }}
                        className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  )}

                  {/* HEADER CARD */}
                  <div className="flex items-center gap-4 mb-6">
                    {req.user ? (
                      <button
                        onClick={() => handleProfileClick(req.user_id)}
                        className="group/avatar relative"
                      >
                        {req.user.avatar_url ? (
                          <SmartImage src={req.user.avatar_url} className="w-14 h-14 rounded-2xl object-cover shadow-lg group-hover/avatar:scale-105 transition-transform" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xl group-hover/avatar:scale-105 transition-transform">
                            {req.user.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </button>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-400">person</span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleProfileClick(req.user_id)}
                          className="font-bold text-brand-obsidian dark:text-white hover:underline text-base"
                        >
                          {req.user?.name || 'Anónimo'}
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-brand-obsidian/5 dark:bg-white/10 px-2 py-0.5 rounded text-brand-obsidian/60 dark:text-white/60">
                          {req.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-brand-obsidian/30 dark:text-white/30 font-black uppercase tracking-widest">
                          {new Date(req.created_at).toLocaleDateString()}
                        </span>
                        {req.is_private && (
                          <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">lock</span>
                            PRIVADO
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* MENSAJE */}
                  <div className="pl-6 border-l-2 border-brand-primary/30 mb-8">
                    <p className="text-xl font-serif text-brand-obsidian/80 dark:text-white/90 italic leading-relaxed">
                      "{req.content}"
                    </p>
                  </div>

                  {/* BOTONES ACCION */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleInteraction.mutate({ requestId: req.id, type: 'amen' })}
                      className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 transition-all border-2 ${req.user_has_interacted
                        ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-inner'
                        : 'bg-brand-obsidian/[0.02] dark:bg-white/5 border-transparent text-brand-obsidian/60 dark:text-white/60 hover:bg-brand-obsidian/5 dark:hover:bg-white/10'
                        }`}
                    >
                      <span className={`material-symbols-outlined ${req.user_has_interacted ? 'fill-1' : ''}`}>
                        bg_connect
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {req.user_has_interacted ? 'Intercediendo' : 'Decir Amén'}
                      </span>
                    </button>

                    {req.interaction_count > 0 && (
                      <button
                        onClick={() => setInteractionsModalRequest(req)}
                        className="h-14 px-6 rounded-2xl bg-brand-obsidian/5 dark:bg-white/5 flex items-center gap-2 hover:bg-brand-obsidian/10 dark:hover:bg-white/10 transition-colors"
                      >
                        <div className="flex -space-x-2">
                          {(req.interactions || []).slice(0, 3).map((interaction, idx) => (
                            <SmartImage key={idx} src={interaction.user?.avatar_url || ''} className="w-6 h-6 rounded-full border-2 border-white dark:border-brand-surface" />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-brand-obsidian/60 dark:text-white/60">
                          {req.interaction_count}
                        </span>
                      </button>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </main>

      {interactionsModalRequest && (
        <InteractionListModal
          interactions={interactionsModalRequest.interactions || []}
          onClose={() => setInteractionsModalRequest(null)}
          onUserClick={(userId) => {
            setInteractionsModalRequest(null);
            handleProfileClick(userId);
          }}
          title="Cuerpo de Cristo Intercediendo"
        />
      )}

    </div>
  );
};

export default PrayerRequests;
