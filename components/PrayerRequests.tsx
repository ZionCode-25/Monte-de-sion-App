import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { usePrayerRequests, PrayerRequest } from '../src/hooks/usePrayerRequests';
import { PrayerCategory } from '../types';
import InteractionListModal from './InteractionListModal';
import { UserProfileOverlay } from './feed/UserProfileOverlay';
import { SmartImage } from './ui/SmartImage';

interface Props {
  onBack: () => void;
}

const PrayerRequests: React.FC<Props> = ({ onBack }) => {
  const { user } = useAuth();

  // States
  const [activeTab, setActiveTab] = useState<'create' | 'wall' | 'mine'>('wall');

  // Profile & Interaction Overlays
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [interactionsModalRequest, setInteractionsModalRequest] = useState<PrayerRequest | null>(null);

  const fetchFilter = activeTab === 'mine' ? 'mine' : 'all';
  const {
    requests,
    addRequest,
    deleteRequest,
    editRequest,
    toggleInteraction
  } = usePrayerRequests(fetchFilter);

  // Form State
  const [requestContent, setRequestContent] = useState('');
  const [category, setCategory] = useState<PrayerCategory>('Espiritual');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PrayerRequest | null>(null);

  const categories: PrayerCategory[] = ['Salud', 'Familia', 'Finanzas', 'Gratitud', 'Espiritual', 'Otro'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRequest) {
        await editRequest.mutateAsync({
          id: editingRequest.id,
          content: requestContent,
          is_private: isPrivate,
          category
        });
      } else {
        await addRequest.mutateAsync({ content: requestContent, category, is_private: isPrivate });
      }

      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        resetForm();
        setActiveTab('wall');
      }, 2000);
    } catch (e) {
      alert("Error al procesar la petición");
    }
  };

  const resetForm = () => {
    setRequestContent('');
    setCategory('Espiritual');
    setIsPrivate(false);
    setEditingRequest(null);
  };

  const handleEdit = (req: PrayerRequest) => {
    setEditingRequest(req);
    setRequestContent(req.content);
    setCategory(req.category);
    setIsPrivate(req.is_private);
    setActiveTab('create');
  };

  const handleInteraction = (pr: PrayerRequest) => {
    // Toggle interaction type 'intercession'
    toggleInteraction.mutate({ requestId: pr.id, type: 'intercession' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Eliminar esta petición?")) {
      await deleteRequest.mutateAsync(id);
    }
  };

  // Render List Helper
  const renderList = () => (
    <div className="space-y-6">
      {requests.length === 0 && (
        <p className="text-center text-brand-obsidian/40 dark:text-white/40 italic py-10">No hay peticiones aún.</p>
      )}
      {requests.map((pr: PrayerRequest) => (
        <div
          key={pr.id}
          className="group relative bg-white dark:bg-brand-surface p-8 rounded-[3rem] border border-brand-obsidian/[0.03] dark:border-white/[0.05] shadow-sm hover:shadow-xl transition-all"
        >
          {/* Owner Actions */}
          {user && user.id === pr.user_id && (
            <div className="absolute top-6 right-6 flex gap-2">
              <button
                onClick={() => handleEdit(pr)}
                className="p-2 bg-brand-primary/10 text-brand-primary rounded-full hover:bg-brand-primary hover:text-brand-obsidian transition-colors"
                title="Editar"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button
                onClick={() => handleDelete(pr.id)}
                className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                title="Eliminar"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          )}

          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <button
                onClick={() => pr.user_id && setSelectedProfileId(pr.user_id)}
                className="w-10 h-10 rounded-xl overflow-hidden hover:opacity-80 transition-opacity bg-brand-primary/10 flex items-center justify-center shrink-0"
              >
                {pr.userAvatar ? (
                  <img src={pr.userAvatar} alt={pr.userName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-brand-primary font-black uppercase text-xs">
                    {pr.userName?.charAt(0) || 'A'}
                  </span>
                )}
              </button>

              <div className="min-w-0">
                <button
                  onClick={() => pr.user_id && setSelectedProfileId(pr.user_id)}
                  className="h4 text-sm font-bold text-brand-obsidian dark:text-white leading-none hover:underline truncate py-1 text-left block"
                >
                  {pr.userName}
                </button>
                <span className="text-[9px] text-brand-obsidian/30 dark:text-white/20 font-black uppercase tracking-widest mt-1.5 inline-block">{new Date(pr.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <span className="bg-brand-obsidian/5 dark:bg-white/5 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest text-brand-primary border border-brand-primary/10 ml-2 whitespace-nowrap">
              {pr.category}
            </span>
          </div>

          <p className="text-lg font-serif font-light text-brand-obsidian/70 dark:text-white/70 italic leading-relaxed mb-8 pl-4 border-l-2 border-brand-primary/20">
            "{pr.content}"
          </p>

          <div className="flex items-center justify-between pt-6 border-t border-brand-obsidian/5 dark:border-white/5">
            <button
              onClick={() => setInteractionsModalRequest(pr)}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <span className="material-symbols-outlined text-brand-primary text-[18px] fill-1">favorite</span>
              <span className="text-[9px] font-bold text-brand-obsidian/40 dark:text-white/30 uppercase tracking-widest hover:underline">
                {pr.interaction_count || 0} intercesores
              </span>
            </button>

            <button
              onClick={() => handleInteraction(pr)}
              className={`h-11 flex items-center gap-2.5 px-6 rounded-2xl transition-all active:scale-95 ${pr.user_has_interacted
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-brand-primary text-brand-obsidian shadow-lg'
                }`}
            >
              <span className={`material-symbols-outlined text-[18px] leading-none ${pr.user_has_interacted ? 'fill-1' : ''}`}>
                {pr.user_has_interacted ? 'check_circle' : 'favorite'}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                {pr.user_has_interacted ? 'INTERCEDIENDO' : 'DECIR AMÉN'}
              </span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

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
                  {editingRequest ? 'Clamor Actualizado' : 'Clamor Recibido'}
                </h3>
                <p className="text-brand-obsidian/60 dark:text-white/40 leading-relaxed font-light italic">"Pedid, y se os dará..."</p>
                {!editingRequest && (
                  <p className="text-[10px] font-bold text-brand-primary mt-4 uppercase tracking-widest">+20 Puntos de Impacto</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-5">
                  <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] ml-2">¿Cuál es el motivo?</label>
                  <div className="grid grid-cols-3 gap-3">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${category === cat ? 'bg-brand-primary border-brand-primary text-brand-obsidian' : 'bg-white dark:bg-brand-surface border-brand-obsidian/5 dark:border-white/5 text-brand-obsidian/40 dark:text-white/40'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] ml-2">Tu petición al Señor</label>
                  <div className="bg-white dark:bg-brand-surface p-8 rounded-[3.5rem] border border-brand-obsidian/5 dark:border-white/5 shadow-2xl">
                    <textarea
                      placeholder="Escribe aquí..."
                      className="w-full bg-brand-silk dark:bg-brand-obsidian/40 border-none rounded-[2.5rem] p-8 text-brand-obsidian dark:text-white placeholder:text-brand-obsidian/20 dark:placeholder:text-white/20 min-h-[200px] focus:ring-2 focus:ring-indigo-500 transition-all text-xl font-light italic leading-relaxed resize-none"
                      value={requestContent}
                      onChange={(e) => setRequestContent(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="flex items-center justify-between p-7 bg-white dark:bg-brand-surface rounded-[2.5rem] border border-brand-obsidian/5 shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPrivate ? 'bg-brand-obsidian text-brand-primary' : 'bg-brand-obsidian/5 text-brand-obsidian/30'}`}>
                      <span className="material-symbols-outlined text-[24px]">{isPrivate ? 'lock' : 'public'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-obsidian dark:text-white leading-none">Petición Privada</p>
                      <p className="text-[9px] text-brand-obsidian/30 dark:text-white/30 font-black uppercase tracking-widest mt-1.5">Solo pastores lo verán</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={`w-14 h-8 rounded-full p-1 transition-colors ${isPrivate ? 'bg-indigo-500' : 'bg-brand-obsidian/10'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                <div className="flex gap-4">
                  {editingRequest && (
                    <button
                      type="button"
                      onClick={() => { resetForm(); setActiveTab('mine'); }}
                      className="flex-1 py-8 bg-brand-obsidian/5 dark:bg-white/5 text-brand-obsidian dark:text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em]"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!requestContent.trim()}
                    className="flex-[2] py-8 bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all disabled:opacity-20 flex items-center justify-center gap-4"
                  >
                    <span className="material-symbols-outlined text-[20px]">{editingRequest ? 'save' : 'send'}</span>
                    {editingRequest ? 'Guardar Cambios' : 'Presentar Clamor'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-10 animate-reveal">
            {activeTab === 'wall' && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-8 rounded-[3rem] text-center mb-6">
                <p className="text-xl font-serif font-medium text-indigo-600 dark:text-indigo-400 leading-relaxed italic mb-3">
                  "Ayudaos unos a otros a llevar vuestras cargas..."
                </p>
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.4em]">Gálatas 6:2</span>
              </div>
            )}
            {activeTab === 'mine' && (
              <div className="text-center mb-6">
                <p className="text-[10px] font-black text-brand-obsidian/40 uppercase tracking-widest">Tus Oraciones</p>
              </div>
            )}

            {renderList()}
          </div>
        )}
      </main>

      {/* --- OVERLAYS --- */}
      {selectedProfileId && user && (
        <UserProfileOverlay
          userId={selectedProfileId}
          currentUserId={user.id}
          onClose={() => setSelectedProfileId(null)}
        />
      )}

      {interactionsModalRequest && (
        <InteractionListModal
          interactions={interactionsModalRequest.interactions || []}
          onClose={() => setInteractionsModalRequest(null)}
          onUserClick={(userId) => {
            setInteractionsModalRequest(null);
            setSelectedProfileId(userId);
          }}
          title="Cuerpo de Cristo Intercediendo"
        />
      )}

    </div>
  );
};

export default PrayerRequests;
