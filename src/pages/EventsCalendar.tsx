import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { EventItem } from '../types';
import { SmartImage } from '../components/ui/SmartImage';
import { formatDateForDisplay, formatTimeForDisplay, getMonthName, getDayNumber } from '../utils/dateUtils';

// Fix Leaflet Icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const EventsCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [reservations, setReservations] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState<string | null>(null);
  const [calendarExpanded, setCalendarExpanded] = useState(false);

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
          capacity: e.capacity ? Number(e.capacity) : 0,
          lat: e.lat,
          lng: e.lng
        })) as EventItem[];
      }
      return [] as EventItem[];
    }
  });

  const categories = ['Todos', 'Celebración', 'Taller', 'Misiones'];

  const [currentDate, setCurrentDate] = useState(new Date());
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const weekDaysFull = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    return { offset, totalDays, month, year };
  }, [currentDate]);

  // Get current week days for mini calendar
  const currentWeekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, []);

  const parseEventDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const datePart = dateStr.split('T')[0].split(' ')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const featuredEvent = useMemo(() => events.find(e => e.isFeatured) || events[0], [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchCategory = activeCategory === 'Todos' || e.category === activeCategory;
      if (!matchCategory) return false;
      // Show all upcoming events (today and future), not filtered by featured
      const eDate = parseEventDate(e.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eDate >= today;
    });
  }, [activeCategory, events]);

  const changeMonth = (offset: number) => {
    const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(nextDate);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  const hasEventOnDay = (day: number) => {
    return events.some(e => {
      const eDate = parseEventDate(e.date);
      return eDate.getDate() === day &&
        eDate.getMonth() === currentDate.getMonth() &&
        eDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const hasEventOnDate = (date: Date) => {
    return events.some(e => {
      const eDate = parseEventDate(e.date);
      return eDate.getDate() === date.getDate() &&
        eDate.getMonth() === date.getMonth() &&
        eDate.getFullYear() === date.getFullYear();
    });
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

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

  const handleShare = async (event: EventItem) => {
    const shareData = {
      title: event.title,
      text: `Te invito a: ${event.title} en ${event.location}. ${event.description}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        triggerToast("¡Evento compartido!");
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
        triggerToast("Copiado al portapapeles");
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const weekLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

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

      {/* --- MINIMALIST WEEKLY CALENDAR (default) / FULL MONTH (expanded) --- */}
      <section className="px-6 mt-8">
        <div className="bg-white dark:bg-brand-surface rounded-[2rem] p-5 shadow-xl border border-brand-obsidian/5 dark:border-white/5 transition-all duration-500">

          {!calendarExpanded ? (
            /* ===== MINI WEEK VIEW ===== */
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-sm font-serif font-bold dark:text-white">
                  Esta Semana
                </h3>
                <button
                  onClick={() => setCalendarExpanded(true)}
                  className="flex items-center gap-1.5 text-[9px] font-black text-brand-primary uppercase tracking-widest hover:underline"
                >
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  Ver Mes
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {currentWeekDays.map((day, i) => {
                  const today = new Date();
                  const isCurrentDay = isSameDay(day, today);
                  const hasEvents = hasEventOnDate(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedDate(day);
                        const eventsOnDay = events.filter(e => {
                          const eDate = parseEventDate(e.date);
                          return isSameDay(eDate, day);
                        });
                        if (eventsOnDay.length > 0) setSelectedEvent(eventsOnDay[0]);
                      }}
                      className={`flex flex-col items-center gap-1 py-3 rounded-2xl transition-all ${isSelected
                        ? 'bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian shadow-lg scale-105'
                        : isCurrentDay
                          ? 'bg-brand-primary/10 text-brand-primary'
                          : 'hover:bg-brand-silk dark:hover:bg-white/5 dark:text-white'
                        }`}
                    >
                      <span className="text-[8px] font-black uppercase tracking-widest opacity-50">{weekDaysFull[i]}</span>
                      <span className="text-lg font-bold leading-none">{day.getDate()}</span>
                      {hasEvents && (
                        <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-brand-primary dark:bg-brand-obsidian' : 'bg-brand-primary'}`}></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ===== FULL MONTH VIEW ===== */
            <div>
              <div className="flex items-center justify-between mb-6 px-2">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-brand-silk dark:hover:bg-white/5 rounded-full transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <h3 className="text-lg font-serif font-bold dark:text-white">
                  {monthNames[currentDate.getMonth()]} <span className="opacity-30">{currentDate.getFullYear()}</span>
                </h3>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-brand-silk dark:hover:bg-white/5 rounded-full transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>

              <div className="grid grid-cols-7 mb-3">
                {weekLabels.map((l, i) => (
                  <span key={i} className="text-center text-[8px] font-black text-brand-obsidian/30 dark:text-white/20 uppercase tracking-widest">{l}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-2">
                {Array.from({ length: daysInMonth.offset }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth.totalDays }).map((_, i) => {
                  const day = i + 1;
                  const hasEvents = hasEventOnDay(day);
                  const isSelected = selectedDate &&
                    day === selectedDate.getDate() &&
                    currentDate.getMonth() === selectedDate.getMonth() &&
                    currentDate.getFullYear() === selectedDate.getFullYear();
                  const today = isToday(day);

                  return (
                    <button
                      key={day}
                      onClick={() => {
                        setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                        const eventsOnDay = events.filter(e => {
                          const d = parseEventDate(e.date);
                          return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                        });
                        if (eventsOnDay.length > 0) {
                          setSelectedEvent(eventsOnDay[0]);
                        } else {
                          triggerToast("No hay eventos este día");
                        }
                      }}
                      className={`relative aspect-square flex items-center justify-center rounded-2xl text-xs font-bold transition-all ${isSelected
                        ? 'bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian shadow-lg scale-110 z-10'
                        : today
                          ? 'bg-transparent text-brand-primary border-2 border-brand-primary shadow-[0_0_15px_rgba(255,183,0,0.3)]'
                          : 'hover:bg-brand-silk dark:hover:bg-white/5 dark:text-white'
                        }`}
                    >
                      {day}
                      {hasEvents && !isSelected && (
                        <div className="absolute bottom-1.5 w-1 h-1 bg-brand-primary rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Collapse button */}
              <button
                onClick={() => setCalendarExpanded(false)}
                className="w-full mt-4 py-2 text-[9px] font-black text-brand-primary uppercase tracking-widest flex items-center justify-center gap-1 hover:underline"
              >
                <span className="material-symbols-outlined text-sm">expand_less</span>
                Ocultar Calendario
              </button>
            </div>
          )}
        </div>
      </section>


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
        <div className="px-6 mt-8 space-y-10">

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

          {/* --- EVENT CARDS (Admin-Style with Prominent Image) --- */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-brand-obsidian/30 dark:text-white/20 uppercase tracking-[0.4em]">Próximos Encuentros</h3>
              <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">{filteredEvents.length} Eventos</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="group bg-white dark:bg-brand-surface rounded-[2rem] overflow-hidden border border-brand-obsidian/5 dark:border-white/5 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col"
                >
                  {/* Image Header - Admin Card Style */}
                  <div className="aspect-[16/9] bg-gray-100 dark:bg-white/5 relative overflow-hidden">
                    <SmartImage
                      src={event.imageUrl || ''}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                    {/* Time badge top-right */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white flex items-center gap-1.5 shadow-sm">
                        <span className="material-symbols-outlined text-xs text-brand-primary">schedule</span>
                        <span className="text-[10px] font-bold tracking-wider">{formatTimeForDisplay(event.time)}</span>
                      </div>
                      {event.isFeatured && (
                        <div className="bg-amber-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-sm" title="Destacado">
                          <span className="material-symbols-outlined text-[14px]">star</span>
                        </div>
                      )}
                    </div>

                    {/* Date badge bottom-left */}
                    <div className="absolute bottom-3 left-3 flex items-end">
                      <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-xl p-2 text-center min-w-[3.5rem] shadow-lg">
                        <span className="block text-xl font-black text-brand-obsidian dark:text-white leading-none">
                          {getDayNumber(event.date)}
                        </span>
                        <span className="block text-[9px] font-bold uppercase text-brand-primary tracking-wider mt-0.5">
                          {getMonthName(event.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-1">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase tracking-widest">
                        {event.category}
                      </span>
                    </div>

                    <h4 className="font-bold text-lg leading-tight text-brand-obsidian dark:text-white mb-2 line-clamp-2">
                      {event.title}
                    </h4>

                    <div className="flex items-start gap-1.5 mb-3 opacity-60">
                      <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0">location_on</span>
                      <p className="text-xs font-medium leading-snug line-clamp-1">{event.location}</p>
                    </div>

                    <p className="text-xs text-brand-obsidian/50 dark:text-white/50 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t border-brand-obsidian/5 dark:border-white/5 flex items-center justify-between">
                      <span className="text-[9px] font-black text-brand-obsidian/30 dark:text-white/30 uppercase tracking-widest">
                        {formatDateForDisplay(event.date)}
                      </span>
                      <span className="text-[9px] font-black text-brand-primary underline decoration-2 underline-offset-4 uppercase tracking-widest group-hover:no-underline">
                        Ver Detalles
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* --- EMPTY STATE --- */}
          {filteredEvents.length === 0 && events.length > 0 && (
            <div className="py-24 flex flex-col items-center text-center animate-reveal">
              <div className="w-24 h-24 bg-brand-obsidian/[0.03] dark:bg-white/[0.03] rounded-full flex items-center justify-center text-brand-obsidian/10 dark:text-white/10 mb-8 border border-brand-obsidian/5">
                <span className="material-symbols-outlined text-6xl">event_busy</span>
              </div>
              <h4 className="text-2xl font-serif font-bold text-brand-obsidian dark:text-white">Tiempo de Reposo</h4>
              <p className="text-brand-obsidian/40 dark:text-white/40 text-sm mt-3 max-w-[200px] leading-relaxed italic">"Aún no hay encuentros programados para esta fecha."</p>
            </div>
          )}


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
              <div className="flex gap-4">
                <button
                  onClick={() => handleShare(selectedEvent)}
                  className="w-14 h-14 bg-white/20 backdrop-blur-3xl rounded-2xl flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all"
                >
                  <span className="material-symbols-outlined text-3xl">share</span>
                </button>
                <button
                  onClick={() => addToCalendar(selectedEvent)}
                  className="w-14 h-14 bg-white/20 backdrop-blur-3xl rounded-2xl flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all"
                >
                  <span className="material-symbols-outlined text-3xl">calendar_add_on</span>
                </button>
              </div>
            </div>

            <div className="absolute bottom-12 left-10 right-10 z-30">
              <span className="bg-brand-primary text-brand-obsidian px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-6 inline-block shadow-2xl">
                {selectedEvent.category}
              </span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-white leading-[0.9] tracking-tighter">
                {selectedEvent.title}
              </h2>
            </div>
          </div>

          <div className="px-8 md:px-10 -mt-12 relative z-40 flex flex-col gap-8">

            {/* Info Cards — NOW INCLUDES DATE */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* DATE CARD — NEW */}
              <div className="bg-white dark:bg-brand-surface p-6 rounded-[2rem] border border-brand-obsidian/5 dark:border-white/5 flex items-center gap-4 shadow-xl">
                <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shrink-0">
                  <span className="material-symbols-outlined text-2xl">calendar_today</span>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-obsidian/30 dark:text-white/20">Fecha</p>
                  <p className="text-lg font-serif font-bold text-brand-obsidian dark:text-white">{formatDateForDisplay(selectedEvent.date)}</p>
                </div>
              </div>
              {/* TIME */}
              <div className="bg-white dark:bg-brand-surface p-6 rounded-[2rem] border border-brand-obsidian/5 dark:border-white/5 flex items-center gap-4 shadow-xl">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 shrink-0">
                  <span className="material-symbols-outlined text-2xl">schedule</span>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-obsidian/30 dark:text-white/20">Horario</p>
                  <p className="text-lg font-serif font-bold text-brand-obsidian dark:text-white">{selectedEvent.time}</p>
                </div>
              </div>
              {/* CAPACITY */}
              <div className="bg-white dark:bg-brand-surface p-6 rounded-[2rem] border border-brand-obsidian/5 dark:border-white/5 flex items-center gap-4 shadow-xl">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                  <span className="material-symbols-outlined text-2xl">group</span>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-obsidian/30 dark:text-white/20">Cupos</p>
                  <p className="text-lg font-serif font-bold text-brand-obsidian dark:text-white">
                    {!selectedEvent.capacity || selectedEvent.capacity === 0 ? 'Libre' : `${selectedEvent.capacity}`}
                  </p>
                </div>
              </div>
              {/* LOCATION */}
              <div className="bg-white dark:bg-brand-surface p-6 rounded-[2rem] border border-brand-obsidian/5 dark:border-white/5 flex items-center gap-4 shadow-xl">
                <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 shrink-0">
                  <span className="material-symbols-outlined text-2xl">location_on</span>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-obsidian/30 dark:text-white/20">Lugar</p>
                  <p className="text-sm font-bold text-brand-obsidian dark:text-white line-clamp-1">{selectedEvent.location}</p>
                </div>
              </div>
            </div>

            <section className="bg-white dark:bg-brand-surface p-10 md:p-12 rounded-[3rem] border border-brand-obsidian/5 dark:border-white/5 shadow-2xl">
              <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em] mb-8">Acerca de este Encuentro</h3>
              <p className="text-xl md:text-2xl font-serif font-medium text-brand-obsidian/80 dark:text-white/90 leading-relaxed italic border-l-4 border-brand-primary pl-8">
                "{selectedEvent.description}"
              </p>
            </section>

            <section>
              <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-[10px] font-black text-brand-obsidian/30 dark:text-white/20 uppercase tracking-[0.5em]">Ubicación del Evento</h3>
                <div className="flex-1 h-[1px] bg-brand-obsidian/5 dark:bg-white/5 ml-8"></div>
              </div>

              {selectedEvent.lat && selectedEvent.lng ? (
                <div className="h-80 rounded-[3.5rem] overflow-hidden shadow-2xl z-0 relative">
                  <MapContainer
                    center={[selectedEvent.lat, selectedEvent.lng]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                    dragging={false}
                    scrollWheelZoom={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[selectedEvent.lat, selectedEvent.lng]} />
                  </MapContainer>
                  <button
                    onClick={() => openInMaps(selectedEvent.location || '')}
                    className="absolute bottom-6 right-6 z-[1000] bg-white/90 dark:bg-black/80 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-brand-primary">directions</span>
                    <span className="text-xs font-bold text-brand-obsidian dark:text-white">Cómo llegar</span>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => openInMaps(selectedEvent.location || '')}
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
              )}
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
