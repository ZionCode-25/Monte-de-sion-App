import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Icons } from '../icons';
import { EventItem } from '../types';

const EventsCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<number>(22);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [reservations, setReservations] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState<string | null>(null);

  const { data: events = [], isLoading: loading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      if (data) {
        return data.map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          date: e.date,
          time: e.time || '00:00',
          location: e.location || 'Sión',
          imageUrl: e.image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
          isFeatured: e.is_featured || false,
          category: (e.category as any) || 'General',
          capacity: e.capacity ? e.capacity.toString() : undefined
        })) as EventItem[];
      }
      return [] as EventItem[];
    }
  });

  const categories = ['Todos', 'Celebración', 'Taller', 'Misiones'];

  const weekDays = [
    { day: 20, label: 'Vie' },
    { day: 21, label: 'Sáb' },
    { day: 22, label: 'Dom', isToday: true },
    { day: 23, label: 'Lun' },
    { day: 24, label: 'Mar' },
    { day: 25, label: 'Mié' },
    { day: 26, label: 'Jue' },
  ];

  const featuredEvent = useMemo(() => events.find(e => e.isFeatured) || events[0], [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(e =>
      (activeCategory === 'Todos' || e.category === activeCategory) &&
      !e.isFeatured &&
      parseInt(e.date.split('-')[2]) >= selectedDate
    );
  }, [activeCategory, selectedDate, events]);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleReserve = (eventId: string) => {
    const newReservations = new Set(reservations);
    if (newReservations.has(eventId)) {
      newReservations.delete(eventId);
      triggerToast("Reserva cancelada");
    } else {
      newReservations.add(eventId);
      triggerToast("¡Lugar reservado con éxito!");
    }
    setReservations(newReservations);
  };

  const openInMaps = (location: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
  };

  const addToCalendar = (event: EventItem) => {
    triggerToast("Añadiendo a tu calendario...");
    setTimeout(() => {
      const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.date.replace(/-/g, '')}T100000Z/${event.date.replace(/-/g, '')}T120000Z&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
      window.open(googleUrl, '_blank');
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-silk dark:bg-brand-obsidian pb-40 animate-reveal">

      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[2000] bg-brand-obsidian text-brand-primary px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-3xl animate-in fade-in slide-in-from-top-4 border border-brand-primary/20">
          {showToast}
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="px-8 pt-12 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_#ffb700]"></div>
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">Calendario Sión</span>
            </div>
            <h2 className="text-5xl font-serif font-bold text-brand-obsidian dark:text-white tracking-tighter leading-none">
              Tu Agenda <br /><span className="italic gold-text-gradient">Espiritual</span>
            </h2>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-brand-surface border border-brand-obsidian/5 dark:border-white/10 flex items-center justify-center text-brand-primary shadow-xl">
            <span className="material-symbols-outlined text-3xl">event_upcoming</span>
          </div>
        </div>
      </header>

      {/* --- DATE STRIP (STICKY) --- */}
      <nav className="sticky top-[80px] z-[120] bg-brand-silk/80 dark:bg-brand-obsidian/80 backdrop-blur-2xl py-6 border-b border-brand-obsidian/[0.03] dark:border-white/[0.05]">
        <div className="flex justify-between px-6 gap-3">
          {weekDays.map((item) => {
            const isSelected = selectedDate === item.day;
            return (
              <button
                key={item.day}
                onClick={() => setSelectedDate(item.day)}
                className={`flex flex-col items-center justify-center flex-1 py-4 rounded-[1.8rem] transition-all duration-500 ${isSelected
                  ? 'bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian shadow-[0_15px_30px_-5px_rgba(255,183,0,0.3)] scale-105 border border-brand-primary/20'
                  : 'bg-white/50 dark:bg-white/[0.02] text-brand-obsidian/30 dark:text-white/20 border border-transparent'
                  }`}
              >
                <span className="text-[8px] font-black uppercase tracking-widest mb-1.5 opacity-60">{item.label}</span>
                <span className="text-xl font-outfit font-black">{item.day}</span>
                {item.isToday && !isSelected && (
                  <div className="mt-1.5 w-1 h-1 rounded-full bg-brand-primary"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* --- PRE-CONTENT LOADING/EMPTY CHECK --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center pt-24 space-y-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-brand-obsidian/40 dark:text-white/40 font-black uppercase tracking-widest text-[10px]">Cargando eventos...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="px-8 mt-12 text-center">
          <div className="w-24 h-24 bg-brand-obsidian/[0.03] dark:bg-white/[0.03] rounded-full flex items-center justify-center text-brand-obsidian/10 dark:text-white/10 mx-auto mb-6 border border-brand-obsidian/5">
            <span className="material-symbols-outlined text-5xl">event_busy</span>
          </div>
          <h4 className="text-xl font-serif font-bold text-brand-obsidian dark:text-white mb-2">Sin Eventos Próximos</h4>
          <p className="text-brand-obsidian/40 dark:text-white/40 text-sm">No hay eventos programados en este momento.</p>
        </div>
      ) : (
        <div className="px-8 mt-8 space-y-12">

          {/* --- CATEGORY FILTERS --- */}
          <section>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap border transition-all duration-500 ${activeCategory === cat
                    ? 'bg-brand-primary text-brand-obsidian border-brand-primary shadow-lg shadow-brand-primary/10'
                    : 'bg-white dark:bg-brand-surface border-brand-obsidian/5 dark:border-white/5 text-brand-obsidian/40 dark:text-white/40'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* --- REFACTORED FEATURED EVENT CARD --- */}
          {featuredEvent && (
            <section>
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-[10px] font-black text-brand-obsidian/30 dark:text-white/20 uppercase tracking-[0.4em]">Enfoque Principal</h3>
                <div className="flex-1 h-[1px] bg-brand-obsidian/5 dark:bg-white/5 ml-6"></div>
              </div>

              <div
                onClick={() => setSelectedEvent(featuredEvent)}
                className="group relative aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-2xl border border-white/5 cursor-pointer flex flex-col justify-end"
              >
                <img
                  src={featuredEvent.imageUrl}
                  alt={featuredEvent.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-obsidian via-brand-obsidian/70 to-transparent"></div>

                {/* Optimized Placement for Badge and Content */}
                <div className="relative p-8 md:p-12 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-primary px-4 py-1.5 rounded-full shadow-xl">
                      <span className="text-[8px] font-black text-brand-obsidian uppercase tracking-[0.2em]">Prioridad Alta</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                      <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">{featuredEvent.category}</span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-brand-primary mb-3">
                      <span className="material-symbols-outlined text-lg">schedule</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{featuredEvent.time}</span>
                    </div>
                    <h4 className="text-4xl md:text-5xl font-serif font-bold text-white leading-[1] tracking-tighter drop-shadow-lg mb-3">
                      {featuredEvent.title}
                    </h4>
                    <p className="text-white/70 text-base font-light leading-relaxed line-clamp-3 italic md:max-w-xl">
                      "{featuredEvent.description}"
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.3em]">Ocupación</span>
                      <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.3em]">88% Completo</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                      <div className="h-full bg-brand-primary w-[88%] rounded-full shadow-[0_0_15px_#ffb700]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* --- LIST OF EVENTS --- */}
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-brand-obsidian/30 dark:text-white/20 uppercase tracking-[0.4em]">Explorar Agenda</h3>
              <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">{filteredEvents.length} Encuentros</span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {filteredEvents.map((event, idx) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="bg-white dark:bg-brand-surface p-6 rounded-[2.5rem] border border-brand-obsidian/[0.03] dark:border-white/[0.05] shadow-sm flex items-center gap-6 group active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-primary/20 group-hover:bg-brand-primary transition-colors"></div>

                  <div className="flex flex-col items-center justify-center min-w-[70px] h-24 bg-brand-silk dark:bg-brand-obsidian rounded-[2rem] border border-brand-obsidian/5 dark:border-white/5 shadow-inner">
                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-tighter opacity-70">JUN</span>
                    <span className="text-3xl font-outfit font-black text-brand-obsidian dark:text-white leading-none mt-1">{event.date.split('-')[2]}</span>
                  </div>

                  <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em]">{event.category}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-white/10"></div>
                      <span className="text-[9px] font-bold text-brand-obsidian/30 dark:text-white/30 uppercase tracking-widest">{event.time}</span>
                    </div>
                    <h5 className="text-xl font-serif font-bold text-brand-obsidian dark:text-white leading-none tracking-tight truncate group-hover:text-brand-primary transition-colors">{event.title}</h5>
                    <div className="flex items-center gap-2 text-brand-obsidian/40 dark:text-white/40">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      <span className="text-[10px] font-medium truncate">{event.location}</span>
                    </div>
                  </div>

                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-brand-primary bg-brand-primary/5 border border-brand-primary/10 group-hover:bg-brand-primary group-hover:text-brand-obsidian transition-all duration-500">
                    <span className="material-symbols-outlined text-2xl">chevron_right</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* --- EMPTY STATE --- */}
          {filteredEvents.length === 0 && (
            <div className="py-24 flex flex-col items-center text-center animate-reveal">
              <div className="w-24 h-24 bg-brand-obsidian/[0.03] dark:bg-white/[0.03] rounded-full flex items-center justify-center text-brand-obsidian/10 dark:text-white/10 mb-8 border border-brand-obsidian/5">
                <span className="material-symbols-outlined text-6xl">event_busy</span>
              </div>
              <h4 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white">Tiempo de Reposo</h4>
              <p className="text-brand-obsidian/40 dark:text-white/40 text-sm mt-3 max-w-[200px] leading-relaxed italic">"Aún no hay encuentros programados para esta fecha."</p>
            </div>
          )}

          {/* --- GLOBAL ACTION --- */}
          <section className="pt-8">
            <div className="bg-brand-obsidian dark:bg-brand-surface rounded-[3.5rem] p-12 relative overflow-hidden shadow-3xl border border-white/5">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px]"></div>
              <div className="relative z-10 text-center lg:text-left">
                <h4 className="text-3xl font-serif font-bold text-white mb-4 tracking-tighter">¿Necesitas Ayuda?</h4>
                <p className="text-white/50 text-sm font-light mb-10 italic max-w-sm mx-auto lg:mx-0">Descarga nuestro calendario mensual completo en PDF para tu hogar.</p>
                <button className="w-full lg:w-fit px-12 py-5 bg-brand-primary text-brand-obsidian rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined">download</span>
                  Descargar PDF
                </button>
              </div>
            </div>
          </section>
        </div>)}

      {/* --- EVENT DETAIL OVERLAY --- */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[1000] bg-brand-silk dark:bg-brand-obsidian animate-in slide-in-from-bottom duration-700 overflow-y-auto no-scrollbar pb-32">

          <div className="relative h-[65dvh] w-full overflow-hidden bg-brand-surface">
            {/* Placeholder to avoid "broken style" while image loads */}
            <div className="absolute inset-0 bg-brand-obsidian/20 animate-pulse"></div>
            <img
              src={selectedEvent.imageUrl}
              className="w-full h-full object-cover relative z-10"
              alt={selectedEvent.title}
              onLoad={(e) => (e.currentTarget.style.opacity = '1')}
              style={{ opacity: 0, transition: 'opacity 0.5s ease-in-out' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-silk dark:from-brand-obsidian via-brand-obsidian/40 to-transparent z-20"></div>

            <div className="absolute top-10 left-8 right-8 flex justify-between items-center z-50">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-14 h-14 bg-white/20 backdrop-blur-3xl rounded-2xl flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all"
              >
                <span className="material-symbols-outlined text-3xl">close</span>
              </button>
              <button
                onClick={() => addToCalendar(selectedEvent)}
                className="w-14 h-14 bg-white/20 backdrop-blur-3xl rounded-2xl flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all"
              >
                <span className="material-symbols-outlined text-3xl">calendar_add_on</span>
              </button>
            </div>

            <div className="absolute bottom-12 left-10 right-10 z-30">
              <span className="bg-brand-primary text-brand-obsidian px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-6 inline-block shadow-2xl">
                {selectedEvent.category}
              </span>
              <h2 className="text-6xl font-serif font-bold text-brand-obsidian dark:text-white leading-[0.9] tracking-tighter">
                {selectedEvent.title}
              </h2>
            </div>
          </div>

          <div className="px-10 -mt-12 relative z-40 flex flex-col gap-10">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-brand-surface p-8 rounded-[3rem] border border-brand-obsidian/5 flex items-center gap-6 shadow-xl">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shrink-0"><span className="material-symbols-outlined text-3xl">schedule</span></div>
                <div><p className="text-[9px] font-black uppercase tracking-widest text-brand-obsidian/30 dark:text-white/20">Horario</p><p className="text-xl font-serif font-bold text-brand-obsidian dark:text-white">{selectedEvent.time}</p></div>
              </div>
              <div className="bg-white dark:bg-brand-surface p-8 rounded-[3rem] border border-brand-obsidian/5 flex items-center gap-6 shadow-xl">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0"><span className="material-symbols-outlined text-3xl">group</span></div>
                <div><p className="text-[9px] font-black uppercase tracking-widest text-brand-obsidian/30 dark:text-white/20">Cupos</p><p className="text-xl font-serif font-bold text-brand-obsidian dark:text-white">{selectedEvent.capacity || 'Libre'}</p></div>
              </div>
              <div className="bg-white dark:bg-brand-surface p-8 rounded-[3rem] border border-brand-obsidian/5 flex items-center gap-6 shadow-xl">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 shrink-0"><span className="material-symbols-outlined text-3xl">check_circle</span></div>
                <div><p className="text-[9px] font-black uppercase tracking-widest text-brand-obsidian/30 dark:text-white/20">Estado</p><p className="text-xl font-serif font-bold text-brand-obsidian dark:text-white">Confirmado</p></div>
              </div>
            </div>

            <section className="bg-white dark:bg-brand-surface p-12 rounded-[4rem] border border-brand-obsidian/5 shadow-2xl">
              <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em] mb-8">Acerca de este Encuentro</h3>
              <p className="text-2xl font-serif font-medium text-brand-obsidian/80 dark:text-white/90 leading-relaxed italic border-l-4 border-brand-primary pl-8 mb-10">
                "{selectedEvent.description}"
              </p>
              <div className="space-y-6 text-brand-obsidian/60 dark:text-white/50 text-lg leading-relaxed font-light">
                <p>Te invitamos a ser parte de esta experiencia transformadora. Este encuentro ha sido diseñado para fortalecer nuestra fe y profundizar en el conocimiento de la Palabra de forma comunitaria.</p>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-[10px] font-black text-brand-obsidian/30 dark:text-white/20 uppercase tracking-[0.5em]">Ubicación del Evento</h3>
                <div className="flex-1 h-[1px] bg-brand-obsidian/5 dark:bg-white/5 ml-8"></div>
              </div>
              <div
                onClick={() => openInMaps(selectedEvent.location)}
                className="group relative h-80 bg-brand-obsidian rounded-[3.5rem] overflow-hidden border border-white/5 shadow-3xl cursor-pointer"
              >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200')] bg-cover bg-center brightness-[0.4] transition-transform duration-[4s] group-hover:scale-105"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-10">
                  <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center text-brand-obsidian shadow-[0_0_40px_rgba(255,183,0,0.5)] mb-6 animate-bounce">
                    <span className="material-symbols-outlined text-4xl font-black">location_on</span>
                  </div>
                  <h4 className="text-white text-2xl font-serif font-bold mb-2">{selectedEvent.location}</h4>
                  <p className="text-brand-primary text-[10px] font-black uppercase tracking-[0.4em]">Pulsa para navegar con GPS</p>
                </div>
              </div>
            </section>

            <div className="h-40"></div>
          </div>

          <div className="fixed bottom-12 left-0 right-0 px-10 z-[1100]">
            <button
              onClick={() => handleReserve(selectedEvent.id)}
              className={`w-full py-8 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-[0_25px_60px_-10px_rgba(0,0,0,0.4)] active:scale-95 transition-all flex items-center justify-center gap-4 ${reservations.has(selectedEvent.id)
                ? 'bg-emerald-500 text-white'
                : 'bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian'
                }`}
            >
              <span className="material-symbols-outlined font-black">
                {reservations.has(selectedEvent.id) ? 'check_circle' : 'confirmation_number'}
              </span>
              {reservations.has(selectedEvent.id) ? '¡Estás Registrado!' : 'Reservar Mi Lugar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsCalendar;
