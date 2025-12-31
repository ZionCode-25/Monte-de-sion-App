import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from './context/AuthContext';
import { usePrayerRequests } from '../src/hooks/usePrayerRequests';
import { SmartImage } from './ui/SmartImage';
import InteractionListModal from './InteractionListModal';

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

  // MODAL
  const [interactionsModalRequest, setInteractionsModalRequest] = useState<any | null>(null);

  // SCROLL
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (highlightId && !isLoading && itemRefs.current[highlightId]) {
      setTimeout(() => itemRefs.current[highlightId]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
    }
  }, [highlightId, isLoading]);

  // HANDLERS
  const handleSave = async () => {
    if (!content.trim()) return;
    try {
      await addRequest.mutateAsync({ content, category, is_private: isPrivate });
      resetForm();
    } catch (e) { console.error(e); }
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Borrar esta petición?")) deleteRequest.mutate(id);
  };

  const resetForm = () => {
    setView('list'); setContent(''); setIsPrivate(false); setCategory('General');
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
              <p className="text-[10px] text-gray-400">Solo visible para pastores y líderes</p>
            </div>
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
              className="bg-white dark:bg-brand-surface rounded-[2rem] p-6 md:p-8 shadow-sm border border-brand-obsidian/5 dark:border-white/5 relative group transition-all hover:shadow-xl"
            >
              {/* DELETE ACTION */}
              {user && user.id === req.user_id && (
                <div className="absolute top-6 right-6 z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(req.id); }}
                    className="w-8 h-8 rounded-full hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              )}

              {/* USER INFO */}
              <div className="flex items-center gap-4 mb-6 cursor-pointer group/profile" onClick={() => navigate(`/profile/${req.user_id}`)}>
                <div className="relative">
                  <SmartImage
                    src={req.user?.avatar_url}
                    className="rounded-full object-cover border border-gray-100 dark:border-white/5"
                    style={{ width: '40px', height: '40px' }}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-brand-primary w-4 h-4 rounded-full border-2 border-white dark:border-brand-surface flex items-center justify-center">
                    <span className="material-symbols-outlined text-[8px] text-white">volunteer_activism</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-obsidian dark:text-white leading-none group-hover/profile:underline decoration-brand-primary decoration-2 underline-offset-2 transition-all">
                    {req.user?.name || 'Anónimo'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-[9px] font-black text-brand-obsidian/40 dark:text-white/40 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {req.category}
                    </span>
                    {req.is_private && (
                      <span className="text-[9px] font-black text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Privado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* CONTENT */}
              <div className="mb-6">
                <p className="text-xl md:text-2xl font-serif font-medium text-brand-obsidian dark:text-white leading-relaxed whitespace-pre-line">
                  "{req.content}"
                </p>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => toggleInteraction.mutate({ requestId: req.id, type: 'amen' })}
                  className={`
                    px-5 py-2 rounded-full flex items-center gap-2 transition-all duration-300
                    ${req.user_has_interacted
                      ? 'bg-brand-obsidian dark:bg-white text-white dark:text-brand-obsidian shadow-lg scale-105'
                      : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 dark:hover:border-white/10'
                    }
                  `}
                >
                  <span className={`material-symbols-outlined text-lg ${req.user_has_interacted ? 'fill-1' : ''}`}>bg_connect</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Amén</span>
                </button>

                {req.interaction_count > 0 && (
                  <button
                    onClick={() => setInteractionsModalRequest(req)}
                    className="flex items-center gap-2 pl-4 py-2 hover:opacity-70 transition-opacity"
                  >
                    <div className="flex -space-x-3">
                      {(req.interactions || []).slice(0, 3).map((i: any, idx: number) => (
                        <div key={idx} className="w-6 h-6 rounded-full border-2 border-white dark:border-brand-surface overflow-hidden bg-gray-100">
                          <img src={i.user?.avatar_url} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
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
