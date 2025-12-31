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

  // DATA
  const { requests, isLoading, addRequest, deleteRequest, toggleInteraction } = usePrayerRequests('all');

  // CREATE STATE
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Espiritual');
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
    await addRequest.mutateAsync({ content, category, is_private: isPrivate });
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Borrar?")) deleteRequest.mutate(id);
  };

  const resetForm = () => {
    setView('list'); setContent(''); setIsPrivate(false);
  };

  if (view === 'create') {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Nueva Petición</h2>
            <button onClick={resetForm} className="text-gray-500">Cancelar</button>
          </div>

          <textarea
            className="w-full h-40 resize-none text-xl mb-6 focus:outline-none text-gray-800 placeholder:text-gray-300"
            placeholder="Escribe tu petición..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />

          <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
            {['Salud', 'Familia', 'Finanzas', 'Gratitud', 'Espiritual', 'Otro'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${category === cat ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-6">
            <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="w-5 h-5" />
            <span className="text-gray-600 font-medium">Privado (Solo Pastores)</span>
          </div>

          <button onClick={handleSave} className="w-full bg-black text-white py-3 rounded-xl font-bold shadow-lg">Publicar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Peticiones</h1>
            <p className="text-gray-500 text-sm">Altar Digital</p>
          </div>
          <div className="flex gap-2">
            {onBack && <button onClick={onBack} className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-gray-600">close</span></button>}
            <button onClick={() => setView('create')} className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg"><span className="material-symbols-outlined">add</span></button>
          </div>
        </header>

        <div>
          {isLoading && <p className="text-center text-gray-400">Cargando...</p>}

          {requests.map((req: any) => (
            <div
              key={req.id}
              ref={el => itemRefs.current[req.id] = el}
              className="bg-white rounded-xl shadow-sm p-4 mb-4 relative" // CARD BASE
            >
              {/* ACTIONS: DELETE (Owner) */}
              {user && user.id === req.user_id && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(req.id); }}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              )}

              {/* HEADER */}
              <div className="flex items-center mb-3">
                {/* AVATAR: STRICT 40PX */}
                <img
                  src={req.user?.avatar_url || 'https://via.placeholder.com/40'}
                  alt="Avatar"
                  className="object-cover rounded-full"
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                  onClick={() => navigate(`/profile/${req.user_id}`)}
                />
                <div className="ml-3">
                  <p className="text-sm font-bold text-gray-900 leading-tight cursor-pointer" onClick={() => navigate(`/profile/${req.user_id}`)}>
                    {req.user?.name || 'Anónimo'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* BODY */}
              <div className="mb-3">
                <p className="text-gray-800 text-base italic leading-relaxed">"{req.content}"</p>
                <div className="mt-2 flex gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-500 uppercase">{req.category}</span>
                  {req.is_private && <span className="px-2 py-1 bg-red-50 text-red-500 text-xs font-bold rounded uppercase">Privado</span>}
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="border-t pt-3 flex items-center justify-between">
                <button
                  onClick={() => toggleInteraction.mutate({ requestId: req.id, type: 'amen' })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${req.user_has_interacted ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  <span className="material-symbols-outlined text-lg">bg_connect</span>
                  <span className="text-xs font-bold uppercase">Amén</span>
                </button>

                {req.interaction_count > 0 && (
                  <button onClick={() => setInteractionsModalRequest(req)} className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-black">
                    <div className="flex -space-x-1">
                      {(req.interactions || []).slice(0, 3).map((i: any, idx: number) => (
                        <img key={idx} src={i.user?.avatar_url} className="w-5 h-5 rounded-full border border-white" style={{ width: '20px', height: '20px' }} />
                      ))}
                    </div>
                    <span>+{req.interaction_count}</span>
                  </button>
                )}
              </div>
            </div>
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
