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
        return data.map((item: any) => {
          let leaders: { name: string; role: string; avatar: string }[] = [];
          const lowerName = item.name.toLowerCase();

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
            id: item.id,
            name: item.name,
            vision: item.vision || '',
            purpose: item.purpose || '',
            activities: item.activities || '',
            schedule: item.schedule || '',
            category: item.category || 'General',
            color: item.color || 'blue',
            heroImage: item.hero_image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070',
            leaders: leaders
          };
        }) as Ministry[];
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
          ministries.map((m) => {
            const lowerName = m.name.toLowerCase();

            // --- DISEÑO: ALABANZA ---
            if (lowerName.includes('alabanza')) {
              return (
                <div
                  key={m.id}
                  onClick={() => navigate(`/ministries/${m.id}`, { state: m })}
                  className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#000] rounded-[3rem] p-8 border border-[#D4AF37]/30 shadow-2xl active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-9xl text-[#D4AF37]">music_note</span>
                  </div>

                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                      <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37] p-1">
                        <img src={m.heroImage} className="w-full h-full rounded-full object-cover" alt="" />
                      </div>
                      <span className="bg-[#D4AF37]/20 text-[#D4AF37] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-[#D4AF37]/20">
                        Adoración
                      </span>
                    </div>

                    <div>
                      <h3 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F2E6C2] mb-2 tracking-tight">
                        {m.name}
                      </h3>
                      <p className="text-sm text-[#D4AF37]/60 font-light leading-relaxed line-clamp-2">
                        {m.purpose}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-[#D4AF37]/10">
                      <div className="flex items-center gap-2 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                        Unirse al Coro
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // --- DISEÑO: MULTIMEDIA ---
            if (lowerName.includes('multimedia')) {
              return (
                <div
                  key={m.id}
                  onClick={() => navigate(`/ministries/${m.id}`, { state: m })}
                  className="group relative bg-[#0f172a] rounded-[2rem] p-1 overflow-hidden active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-20 group-hover:opacity-40 transition-opacity animate-gradient-x"></div>
                  <div className="relative bg-[#0f172a] h-full rounded-[1.8rem] p-7 flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                      <div className="w-14 h-14 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
                        <span className="material-symbols-outlined text-3xl text-cyan-400">videocam</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-3xl font-mono font-bold text-white mb-2 tracking-tighter">
                        {`<${m.name}/>`}
                      </h3>
                      <p className="text-xs text-cyan-200/50 font-mono leading-relaxed line-clamp-2 border-l-2 border-cyan-500/30 pl-3">
                        {m.purpose}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 flex justify-end">
                      <span className="text-cyan-400 font-mono text-xs group-hover:underline">Next_Gen_Media -&gt;</span>
                    </div>
                  </div>
                </div>
              );
            }

            // --- DISEÑO: DANZA ---
            if (lowerName.includes('danza')) {
              return (
                <div
                  key={m.id}
                  onClick={() => navigate(`/ministries/${m.id}`, { state: m })}
                  className="group relative bg-gradient-to-b from-rose-50 to-white dark:from-rose-950 dark:to-black rounded-[4rem] rounded-tr-none p-8 border border-rose-100 dark:border-rose-900 shadow-xl active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-200 dark:bg-rose-800 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>

                  <div className="relative z-10">
                    <div className="mb-6">
                      <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        Artes
                      </span>
                    </div>

                    <h3 className="text-4xl font-serif italic text-rose-950 dark:text-rose-50 mb-3 group-hover:translate-x-2 transition-transform duration-500">
                      {m.name}
                    </h3>

                    <p className="text-sm text-rose-800/60 dark:text-rose-200/50 font-light mb-8 line-clamp-2">
                      {m.purpose}
                    </p>

                    <div className="w-full h-[1px] bg-gradient-to-r from-rose-200 to-transparent mb-4"></div>

                    <div className="flex justify-between items-center text-rose-400 text-xs font-black uppercase tracking-widest">
                      <span>Expresión</span>
                      <span className="material-symbols-outlined">filter_vintage</span>
                    </div>
                  </div>
                </div>
              );
            }

            // --- DISEÑO: EVANGELIZACIÓN ---
            if (lowerName.includes('evangelización') || lowerName.includes('evangelizacion')) {
              return (
                <div
                  key={m.id}
                  onClick={() => navigate(`/ministries/${m.id}`, { state: m })}
                  className="group relative bg-orange-50 dark:bg-orange-950/20 rounded-[2.5rem] p-8 border-2 border-dashed border-orange-200 dark:border-orange-800 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <span className="material-symbols-outlined text-[15rem] text-orange-900">public</span>
                  </div>

                  <div className="relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">campaign</span>
                    </div>

                    <h3 className="text-2xl font-black uppercase text-orange-900 dark:text-orange-100 mb-2 tracking-wide">
                      {m.name}
                    </h3>

                    <p className="text-xs text-orange-800/60 dark:text-orange-200/60 font-medium mb-6">
                      Llevando la palabra a todos los rincones
                    </p>

                    <button className="w-full py-3 bg-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-orange-500/30 group-hover:bg-orange-600 transition-colors">
                      Unirse a la Misión
                    </button>
                  </div>
                </div>
              );
            }

            // --- DISEÑO: JÓVENES ---
            if (lowerName.includes('jóvenes') || lowerName.includes('jovenes')) {
              return (
                <div
                  key={m.id}
                  onClick={() => navigate(`/ministries/${m.id}`, { state: m })}
                  className="group relative bg-black rounded-[3rem] p-8 overflow-hidden active:scale-[0.98] transition-all cursor-pointer"
                >
                  {/* Graffiti/Paint Effect */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-bl-[100%] z-0 group-hover:scale-110 transition-transform"></div>

                  <div className="relative z-10">
                    <h3 className="text-5xl font-black text-white italic -skew-x-12 tracking-tighter mb-1 drop-shadow-[4px_4px_0_rgba(250,204,21,1)]">
                      HCH
                    </h3>
                    <h3 className="text-4xl font-black text-transparent text-stroke-white italic -skew-x-12 tracking-tighter mb-6">
                      29
                    </h3>

                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                      <p className="text-white text-xs font-bold leading-tight">
                        {m.purpose}
                      </p>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <span className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-black text-xs uppercase -rotate-2 group-hover:rotate-0 transition-transform">
                        Juventud Radical
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            // --- DISEÑO DEFAULT ---
            return (
              <div
                key={m.id}
                onClick={() => navigate(`/ministries/${m.id}`, { state: m })}
                className="group relative bg-white dark:bg-brand-surface rounded-[3rem] p-8 border border-brand-obsidian/5 dark:border-white/5 shadow-xl active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary group-hover:w-4 transition-all"></div>

                <div className="flex flex-col gap-6 pl-4">
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
                    <div className="flex items-center gap-2 text-brand-primary text-[10px] font-black uppercase tracking-[0.2em] ml-auto">
                      Ver Detalles
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MinistriesList;
