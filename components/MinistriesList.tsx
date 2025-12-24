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

            // --- DISEÑO: ALABANZA (Adoración) ---
            if (lowerName.includes('alabanza')) {
              return (
                <div
                  key={m.id}
                  onClick={() => navigate(`/ministries/${m.id}`, { state: m })}
                  className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#000] rounded-[3rem] p-8 border border-[#D4AF37]/30 shadow-2xl active:scale-[0.98] transition-all cursor-pointer overflow-hidden pb-32"
                >
                  {/* Animación de Ondas Musicales CSS */}
                  <div className="absolute inset-0 opacity-20 flex items-center justify-center pointer-events-none">
                    <div className="w-[150%] h-[150%] border border-[#D4AF37] opacity-20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute w-[120%] h-[120%] border border-[#D4AF37] opacity-20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                  </div>

                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity duration-1000 transform group-hover:rotate-12">
                    <span className="material-symbols-outlined text-[10rem] text-[#D4AF37]">music_note</span>
                  </div>

                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                      <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-full flex items-center justify-center border border-[#D4AF37]/30 text-[#D4AF37]">
                        <span className="material-symbols-outlined text-3xl">queue_music</span>
                      </div>
                      <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-[#D4AF37]/20 backdrop-blur-md">
                        Adoración
                      </span>
                    </div>

                    <div>
                      <h3 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F2E6C2] to-[#D4AF37] bg-[length:200%_auto] animate-gradient mb-4 pt-2 tracking-tight leading-snug">
                        {m.name}
                      </h3>
                      <p className="text-sm text-[#D4AF37]/80 font-normal leading-relaxed line-clamp-3 max-w-[90%] relative z-20">
                        {m.purpose}
                      </p>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between border-t border-[#D4AF37]/10 pt-6">
                      <div className="flex items-center gap-2 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">
                        Unirse al Coro
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // --- DISEÑO: MULTIMEDIA (Tech) ---
            if (lowerName.includes('multimedia')) {
              return (
                <div
                  key={m.id}
                  onClick={() => navigate(`/ministries/${m.id}`, { state: m })}
                  className="group relative bg-[#0f172a] rounded-[2rem] p-[1px] overflow-hidden active:scale-[0.98] transition-all cursor-pointer pb-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-20 group-hover:opacity-50 transition-opacity animate-gradient-x"></div>
                  <div className="relative bg-[#0f172a] h-full rounded-[2rem] p-8 flex flex-col gap-6">
                    {/* Grid Pattern Background */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#22d3ee 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                    <div className="relative z-10 flex justify-between items-start">
                      <div className="w-14 h-14 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        <span className="material-symbols-outlined text-3xl text-cyan-400">videocam</span>
                      </div>
                      <div className="flex gap-1.5 bg-black/40 p-2 rounded-full border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                    </div>

                    <div className="relative z-10 pl-4 border-l-2 border-cyan-500/30">
                      <h3 className="text-3xl font-mono font-bold text-white mb-2 tracking-tighter group-hover:text-cyan-400 transition-colors">
                        {`<${m.name}/>`}
                      </h3>
                      <p className="text-xs text-cyan-200/50 font-mono leading-relaxed line-clamp-2">
                        {m.purpose}
                      </p>
                    </div>

                    <div className="relative z-10 mt-6 pt-4 border-t border-white/5 flex justify-end">
                      <span className="text-cyan-400 font-mono text-xs group-hover:underline flex items-center gap-2">
                        Next_Gen_Media <span className="material-symbols-outlined text-sm">terminal</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            // --- DISEÑO: DANZA (Artes) ---
            if (lowerName.includes('danza')) {
              return (
                <div
                  key={m.id}
                  onClick={() => navigate(`/ministries/${m.id}`, { state: m })}
                  className="group relative bg-gradient-to-b from-rose-50 to-white dark:from-[#2a0a10] dark:to-black rounded-[4rem] rounded-tr-none p-8 border border-rose-100 dark:border-rose-900 shadow-xl active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
                >
                  <div className="absolute -right-10 -top-10 w-56 h-56 bg-rose-200 dark:bg-rose-800 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
                  <div className="absolute -left-10 bottom-0 w-40 h-40 bg-pink-300 dark:bg-pink-900 rounded-full blur-[60px] opacity-20"></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">palette</span> Artes
                      </span>

                      <div className="w-10 h-10 rounded-full border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-400">
                        <span className="material-symbols-outlined">filter_vintage</span>
                      </div>
                    </div>

                    <h3 className="text-5xl font-serif italic text-rose-950 dark:text-rose-50 mb-3 group-hover:translate-x-3 transition-transform duration-700">
                      {m.name}
                    </h3>

                    <p className="text-sm text-rose-800/60 dark:text-rose-200/50 font-light mb-10 line-clamp-2 mix-blend-multiply dark:mix-blend-normal">
                      {m.purpose}
                    </p>

                    <div className="flex justify-between items-center text-rose-400 text-xs font-black uppercase tracking-widest border-t border-rose-100 dark:border-rose-900/30 pt-4">
                      <span>Expresión Espiritual</span>
                      <span className="material-symbols-outlined group-hover:rotate-45 transition-transform duration-500">north_east</span>
                    </div>
                  </div>
                </div>
              );
            }

            // --- DISEÑO: EVANGELIZACIÓN (Misión) ---
            if (lowerName.includes('evangelización') || lowerName.includes('evangelizacion')) {
              return (
                <div
                  key={m.id}
                  onClick={() => navigate(`/ministries/${m.id}`, { state: m })}
                  className="group relative bg-orange-50 dark:bg-[#1a0e05] rounded-[2.5rem] p-8 border-2 border-dashed border-orange-200 dark:border-orange-900 active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-[2s]">
                    <span className="material-symbols-outlined text-[15rem] text-orange-900 dark:text-orange-500">public</span>
                  </div>

                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400 mb-6 flex items-center justify-center group-hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-shadow duration-500">
                      <span className="material-symbols-outlined text-4xl animate-bounce">campaign</span>
                    </div>

                    <h3 className="text-3xl font-black uppercase text-orange-900 dark:text-orange-100 mb-3 tracking-wide">
                      {m.name}
                    </h3>

                    <div className="w-12 h-1 bg-orange-500 rounded-full mb-4"></div>

                    <p className="text-xs text-orange-800/60 dark:text-orange-200/60 font-medium mb-8 max-w-[80%]">
                      Llevando la palabra a todos los rincones de la tierra.
                    </p>

                    <button className="w-full py-4 bg-orange-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-orange-500/30 group-hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
                      Unirse a la Misión
                      <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                  </div>
                </div>
              );
            }

            // --- DISEÑO: JÓVENES (Urbano) ---
            if (lowerName.includes('jóvenes') || lowerName.includes('jovenes')) {
              return (
                <div
                  key={m.id}
                  onClick={() => navigate(`/ministries/${m.id}`, { state: m })}
                  className="group relative bg-black rounded-[3rem] p-8 overflow-hidden active:scale-[0.98] transition-all cursor-pointer border border-white/10"
                >
                  {/* Abstract Graffiti Effect */}
                  <div className="absolute top-0 right-0 w-full h-full opacity-30 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #333 0, #333 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }}></div>

                  <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-yellow-400 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                      <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded text-[10px] font-black uppercase text-white tracking-wider border border-white/20">
                        Juventud
                      </div>
                      <span className="text-4xl">🔥</span>
                    </div>

                    <h3 className="text-6xl font-black text-white italic -skew-x-12 tracking-tighter mb-1 drop-shadow-[5px_5px_0_#ca8a04] group-hover:translate-x-2 transition-transform duration-300">
                      HCH
                    </h3>
                    <h3 className="text-5xl font-black text-transparent text-stroke-white italic -skew-x-12 tracking-tighter mb-8">
                      29
                    </h3>

                    <div className="mt-6 flex justify-between items-end border-t border-white/10 pt-6">
                      <p className="text-white/50 text-xs w-2/3 line-clamp-2">Generación apasionada por Jesús</p>
                      <div className="w-10 h-10 bg-yellow-400 text-black rounded-full flex items-center justify-center transform group-hover:rotate-90 transition-transform duration-500">
                        <span className="material-symbols-outlined">arrow_outward</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // --- DISEÑO DEFAULT (Sin Foto) ---
            return (
              <div
                key={m.id}
                onClick={() => navigate(`/ministries/${m.id}`, { state: m })}
                className="group relative bg-white dark:bg-brand-surface rounded-[3rem] p-8 border border-brand-obsidian/5 dark:border-white/5 shadow-xl active:scale-[0.98] transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary group-hover:w-4 transition-all duration-300"></div>

                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                  <span className="material-symbols-outlined text-9xl">church</span>
                </div>

                <div className="relative z-10 flex flex-col gap-6 pl-4">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary border border-brand-primary/10 shadow-sm">
                      <span className="material-symbols-outlined text-2xl">star</span>
                    </div>
                    <div className="bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-brand-primary/10">
                      {m.category}
                    </div>
                  </div>

                  <div className="py-2">
                    <h3 className="text-3xl font-serif font-bold text-brand-obsidian dark:text-brand-silk mb-2 tracking-tight group-hover:text-brand-primary transition-colors">
                      {m.name}
                    </h3>
                    <p className="text-sm text-brand-obsidian/50 dark:text-brand-silk/50 font-light leading-relaxed line-clamp-2">
                      {m.purpose}
                    </p>
                  </div>

                  <div className="flex items-center justify-end pt-4 border-t border-brand-obsidian/5 dark:border-white/5">
                    <div className="flex items-center gap-2 text-brand-primary text-[10px] font-black uppercase tracking-[0.2em]">
                      Ver Detalles
                      <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
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
