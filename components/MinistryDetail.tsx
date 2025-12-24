import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './context/AuthContext';
import { Ministry } from '../types';

const MinistryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const initialData = location.state as Ministry | undefined;

  const [showForm, setShowForm] = useState(false);
  const [formText, setFormText] = useState('');

  // 1. Fetch Ministry Data
  const { data: ministry, isLoading: loadingMinistry } = useQuery({
    queryKey: ['ministry', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('ministries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      let leaders: { name: string; role: string; avatar: string }[] = [];
      const lowerName = data.name.toLowerCase();

      if (lowerName.includes('alabanza')) {
        leaders = [{ name: 'Mayra Guevara y Rodolfo Vega', role: 'Líderes', avatar: '/images/Alabanza.png' }];
      } else if (lowerName.includes('multimedia')) {
        leaders = [{ name: 'Cristian Bordón', role: 'Líder', avatar: '/images/Multimedia.png' }];
      } else if (lowerName.includes('danza')) {
        leaders = [{ name: 'Mayra Guevara', role: 'Líder', avatar: '/images/Danza.png' }];
      } else if (lowerName.includes('evangelización') || lowerName.includes('evangelizacion')) {
        leaders = [{ name: 'Marcelo Flores', role: 'Líder', avatar: '/images/Evangelizacion.png' }];
      } else if (lowerName.includes('jóvenes') || lowerName.includes('jovenes')) {
        leaders = [{ name: 'Hch 29', role: 'Liderazgo', avatar: '/images/Jovenes.png' }];
      }

      return {
        id: data.id,
        name: data.name,
        vision: data.vision || '',
        purpose: data.purpose || '',
        activities: data.activities || '',
        schedule: data.schedule || '',
        category: data.category || 'General',
        color: data.color || 'blue',
        heroImage: data.hero_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070',
        leaders: leaders
      } as Ministry;
    },
    initialData: initialData,
    enabled: !!id
  });

  // 2. Fetch Inscription Status
  const { data: isRegistered, isLoading: loadingInscription } = useQuery({
    queryKey: ['inscription', id, user?.id],
    queryFn: async () => {
      if (!user || !id) return false;
      const { data } = await supabase.from('inscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('ministry_id', id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!id
  });

  // 3. Register Mutation
  const registerMutation = useMutation({
    mutationFn: async (note: string) => {
      if (!user || !ministry) throw new Error("No user or ministry");
      const { error } = await supabase.from('inscriptions').insert({
        user_id: user.id,
        ministry_id: ministry.id,
        note: note,
        status: 'pending'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscription'] });
      setShowForm(false);
    },
    onError: (e) => {
      console.error(e);
      alert("Error al inscribirse: " + e.message);
    }
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formText.trim()) return;
    registerMutation.mutate(formText);
  };

  const handleBack = () => {
    navigate('/ministries');
  };

  if (!ministry && !loadingMinistry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Ministerio no encontrado</p>
        <button onClick={handleBack}>Volver</button>
      </div>
    );
  }

  if (loadingMinistry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-brand-silk dark:bg-brand-obsidian">
        <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-silk dark:bg-brand-obsidian animate-reveal">

      {/* Immersive Header */}
      <div className="relative h-[55vh] w-full overflow-hidden">
        <img
          src={ministry!.heroImage}
          alt={ministry!.name}
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-silk dark:from-brand-obsidian via-brand-obsidian/30 to-transparent"></div>

        <button
          onClick={handleBack}
          className="absolute top-10 left-6 w-12 h-12 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all z-50"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>

        <div className="absolute bottom-16 left-8 right-8">
          <span className="bg-brand-primary text-brand-obsidian px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.4em] mb-4 inline-block shadow-xl">
            {ministry!.category}
          </span>
          <h2 className="text-6xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tighter leading-[0.9]">
            {ministry!.name}
          </h2>
        </div>
      </div>

      {/* Content Body */}
      <div className="px-8 pb-64 -mt-10 relative z-10 flex flex-col gap-12">

        {/* About Section */}
        <section className="bg-white dark:bg-brand-surface p-10 rounded-[3.5rem] shadow-2xl border border-brand-obsidian/5 dark:border-white/5">
          <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em] mb-6">Misión del Equipo</h3>
          <p className="text-2xl font-serif font-bold text-brand-obsidian dark:text-brand-silk leading-tight italic mb-8 border-l-4 border-brand-primary pl-6">
            "{ministry!.vision}"
          </p>
          <p className="text-base text-brand-obsidian/60 dark:text-brand-silk/60 leading-relaxed font-light">
            {ministry!.purpose}
          </p>
        </section>

        {/* Info Grid (Bento Style) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-brand-surface p-8 rounded-[3rem] border border-brand-obsidian/5 dark:border-white/5 flex items-center gap-6 shadow-sm">
            <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shrink-0">
              <span className="material-symbols-outlined text-3xl">event_repeat</span>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-brand-obsidian/30 dark:text-white/30 tracking-widest mb-1">Días y Horarios</p>
              <p className="text-lg font-bold text-brand-obsidian dark:text-brand-silk leading-tight">{ministry!.schedule}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-brand-surface p-8 rounded-[3rem] border border-brand-obsidian/5 dark:border-white/5 flex items-center gap-6 shadow-sm">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
              <span className="material-symbols-outlined text-3xl">person_check</span>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-brand-obsidian/30 dark:text-white/30 tracking-widest mb-1">Disponibilidad</p>
              <p className="text-lg font-bold text-brand-obsidian dark:text-brand-silk leading-tight">Cupos Abiertos</p>
            </div>
          </div>
        </section>

        {/* Leadership Section Removed */}

        {/* Sticky CTA Area */}
        {!isRegistered ? (
          <div className="fixed bottom-32 left-0 right-0 px-8 z-[100] animate-in slide-in-from-bottom duration-700">
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian py-7 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] active:scale-95 transition-all flex items-center justify-center gap-4"
            >
              Inscribirme Ahora
              <span className="material-symbols-outlined font-bold">arrow_forward</span>
            </button>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-12 rounded-[3.5rem] text-center animate-reveal">
            <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
              <span className="material-symbols-outlined text-4xl font-black">check</span>
            </div>
            <h4 className="text-2xl font-serif font-bold text-emerald-600 mb-2">Solicitud Enviada</h4>
            <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest">Un líder se contactará contigo pronto</p>
          </div>
        )}
      </div>

      {/* Modern Form Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-brand-obsidian/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative w-full max-w-md bg-brand-silk dark:bg-brand-surface rounded-[4rem] p-12 flex flex-col shadow-3xl">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-8 right-8 w-12 h-12 rounded-full bg-brand-obsidian/5 dark:bg-white/5 flex items-center justify-center text-brand-obsidian/30 dark:text-white/30"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <header className="mb-12 text-center pt-4">
              <h3 className="text-4xl font-serif font-bold text-brand-obsidian dark:text-brand-silk tracking-tighter">Postularse</h3>
              <p className="text-brand-obsidian/40 dark:text-white/40 text-[9px] uppercase font-black tracking-[0.3em] mt-3">Únete al equipo de {ministry!.name}</p>
            </header>

            <form onSubmit={handleRegister} className="flex flex-col gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest ml-4">Motivación</label>
                <textarea
                  autoFocus
                  required
                  placeholder="¿Qué te impulsa a servir en este ministerio?"
                  className="w-full bg-brand-obsidian/[0.03] dark:bg-brand-obsidian/40 border-none rounded-[2.5rem] p-8 text-brand-obsidian dark:text-white placeholder:text-brand-obsidian/20 dark:placeholder:text-white/20 min-h-[180px] focus:ring-2 focus:ring-brand-primary transition-all text-sm leading-relaxed"
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full py-6 bg-brand-primary text-brand-obsidian rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all disabled:opacity-50"
              >
                {registerMutation.isPending ? 'Enviando...' : 'Enviar mi Postulación'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinistryDetail;
