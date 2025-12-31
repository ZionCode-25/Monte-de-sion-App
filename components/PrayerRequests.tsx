import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { usePrayerRequests } from '../src/hooks/usePrayerRequests';
import { SmartImage } from './ui/SmartImage';
import InteractionListModal from './InteractionListModal';

const PrayerRequests: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'create'>('list');

  // Data
  const { requests, isLoading, addRequest, deleteRequest, editRequest, toggleInteraction } = usePrayerRequests('all');

  // Create/Edit State
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Espiritual');
  const [isPrivate, setIsPrivate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Modals
  const [interactionsModalRequest, setInteractionsModalRequest] = useState<any | null>(null);

  // Scroll
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (highlightId && !isLoading && itemRefs.current[highlightId]) {
      setTimeout(() => itemRefs.current[highlightId]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
    }
  }, [highlightId, isLoading]);

  // Handlers
  const handleSave = async () => {
    if (!content.trim()) return;
    try {
      if (editingId) {
        await editRequest.mutateAsync({ id: editingId, updates: { content, category, is_private: isPrivate } });
      } else {
        await addRequest.mutateAsync({ content, category, is_private: isPrivate });
      }
      resetForm();
    } catch (e) { alert("Error al guardar"); }
  };

  const handleEdit = (r: any) => {
    setEditingId(r.id); setContent(r.content); setCategory(r.category); setIsPrivate(r.is_private);
    setView('create');
  };

  const handleDelete = (id: string) => { if (confirm("¿Eliminar?")) deleteRequest.mutate(id); };
  const resetForm = () => { setView('list'); setEditingId(null); setContent(''); setIsPrivate(false); };

  if (view === 'create') {
    return (
      <div className="min-h-screen bg-white dark:bg-black p-6 animate-fade-in">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold dark:text-white">{editingId ? 'Editar Petición' : 'Nueva Petición'}</h2>
            <button onClick={resetForm} className="text-gray-500">Cancelar</button>
          </div>

          <textarea placeholder="¿Cuál es tu petición hoy?" value={content} onChange={e => setContent(e.target.value)} className="w-full h-40 bg-transparent resize-none text-2xl font-medium text-gray-800 dark:text-gray-200 focus:outline-none placeholder:text-gray-300" />

          <div className="flex gap-2 overflow-x-auto pb-2">
            {['Salud', 'Familia', 'Finanzas', 'Gratitud', 'Espiritual', 'Otro'].map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${category === cat ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 py-4 border-t border-gray-100 dark:border-zinc-800">
            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="w-5 h-5 accent-black" />
            <span className="text-gray-600 dark:text-gray-400 font-medium">Privado (Solo Pastores)</span>
          </div>

          <button onClick={handleSave} className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg shadow-xl">
            {editingId ? 'Actualizar' : 'Publicar Fe'}
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
            <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">Peticiones</h1>
            <p className="text-gray-500 text-sm">Altar Digital</p>
          </div>
          <div className="flex gap-2">
            {onBack && <button onClick={onBack} className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-black dark:text-white"><span className="material-symbols-outlined">close</span></button>}
            <button onClick={() => setView('create')} className="w-12 h-12 bg-black dark:bg-white rounded-full text-white dark:text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform"><span className="material-symbols-outlined">add</span></button>
          </div>
        </header>

        <div className="space-y-6">
          {isLoading && <p className="text-center text-gray-400">Cargando...</p>}

          {requests.map((req: any) => (
            <article key={req.id} ref={el => itemRefs.current[req.id] = el} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800 transition-all hover:shadow-md">
              {/* HEADER */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${req.user_id}`)}>
                  <SmartImage src={req.user?.avatar_url} className="w-[40px] h-[40px] rounded-full object-cover bg-gray-200" />
                  <div>
                    <h3 className="font-bold text-black dark:text-white leading-none text-sm">{req.user?.name || 'Anónimo'}</h3>
                    <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {/* Actions */}
                {user && user.id === req.user_id && (
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(req)} className="text-gray-400 hover:text-black dark:hover:text-white"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                    <button onClick={() => handleDelete(req.id)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                  </div>
                )}
              </div>

              {/* BODY */}
              <div className="mb-6">
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200 italic">"{req.content}"</p>
                <div className="flex gap-2 mt-4">
                  <span className="px-3 py-1 bg-gray-50 dark:bg-zinc-800 text-[10px] font-bold uppercase tracking-widest text-gray-500 rounded-full">{req.category}</span>
                  {req.is_private && <span className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-[10px] font-bold uppercase tracking-widest text-red-500 rounded-full flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">lock</span> Privado</span>}
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex items-center justify-between border-t border-gray-50 dark:border-zinc-800 pt-4">
                <button
                  onClick={() => toggleInteraction.mutate({ requestId: req.id, type: 'amen' })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${req.user_has_interacted ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'}`}
                >
                  <span className="material-symbols-outlined text-lg">bg_connect</span>
                  <span className="text-xs font-bold uppercase tracking-wide">Amén</span>
                </button>

                {req.interaction_count > 0 && (
                  <button onClick={() => setInteractionsModalRequest(req)} className="flex -space-x-2">
                    {(req.interactions || []).slice(0, 3).map((i: any, idx: number) => (
                      <SmartImage key={idx} src={i.user?.avatar_url} className="w-8 h-8 rounded-full border-2 border-white dark:border-black" />
                    ))}
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 border-2 border-white dark:border-black flex items-center justify-center text-[10px] font-bold">
                      +{req.interaction_count}
                    </div>
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
