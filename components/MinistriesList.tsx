import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Ministry } from '../types';

const MinistriesList: React.FC = () => {
  const navigate = useNavigate();

  const { data: ministries = [], isLoading: loading } = useQuery({
    queryKey: ['ministries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ministries')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        return data.map((item: any) => ({
          id: item.id,
          name: item.name,
          vision: item.vision || '',
          purpose: item.purpose || '',
          activities: item.activities || '',
          schedule: item.schedule || '',
          category: item.category || 'General',
          color: item.color || 'blue',
          heroImage: item.hero_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070',
          leaders: []
        })) as Ministry[];
      }
      return [] as Ministry[];
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-brand-silk dark:bg-brand-obsidian animate-reveal">

      {/* Hero Section */}
      <div className="relative h-80 w-full overflow-hidden rounded-b-[4rem] shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-obsidian via-brand-obsidian/40 to-transparent"></div>
        <div className="absolute bottom-12 left-8 right-8">
          <p className="text-brand-primary text-[10px] font-black uppercase tracking-[0.4em] mb-3">Servicio y Entrega</p>
          <h2 className="font-serif text-5xl font-bold leading-none text-white tracking-tighter">
            Equipos de <br /><span className="gold-text-gradient italic">Reino</span>
          </h2>
        </div>
      </div>

      {/* Grid de Ministerios */}
      <div className="flex flex-col gap-10 px-6 pt-12 pb-44">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black text-brand-obsidian/30 dark:text-white/30 uppercase tracking-[0.3em]">Ministerios Disponibles</h3>
          <span className="w-12 h-[1px] bg-brand-primary/30"></span>
        </div>

        {loading ? (
          <div className="flex justify-center p-10">
            <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin"></div>
          </div>
        ) : ministries.length === 0 ? (
          <div className="text-center opacity-50 text-sm">No hay ministerios registrados aún.</div>
        ) : (
          ministries.map((m) => (
            <div
              key={m.id}
              onClick={() => navigate(`/ministries/${m.id}`, { state: m })}
              className="group relative bg-white dark:bg-brand-surface rounded-[3rem] p-8 border border-brand-obsidian/5 dark:border-white/5 shadow-xl active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-brand-primary/20">
                    <img src={m.heroImage} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-brand-primary/10">
                    {m.category}
                  </div>
                </div>

                <div>
                  <h3 className="text-3xl font-serif font-bold text-brand-obsidian dark:text-brand-silk mb-2 tracking-tight group-hover:text-brand-primary transition-colors">
                    {m.name}
                  </h3>
                  <p className="text-sm text-brand-obsidian/50 dark:text-brand-silk/50 font-light leading-relaxed line-clamp-2">
                    {m.purpose}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-brand-obsidian/5 dark:border-white/5">
                  <div className="flex -space-x-3">
                    {m.leaders.map((l, i) => (
                      <img key={i} src={l.avatar} className="w-8 h-8 rounded-full border-2 border-white dark:border-brand-surface object-cover" alt="" />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-brand-primary text-[10px] font-black uppercase tracking-[0.2em]">
                    Ver Detalles
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MinistriesList;
