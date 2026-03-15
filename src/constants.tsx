
import { AppRole, NewsItem, EventItem, Ministry, Post, Devotional, AppNotification, Story, Inscription, PrayerRequest } from './types';

export const LOGO_DARK_THEME = 'https://res.cloudinary.com/dkl5uieu5/image/upload/v1766460976/Gemini_Generated_Image_t96o6t96o6t96o6t-removebg-preview_iomyit.png';
export const LOGO_LIGHT_THEME = 'https://res.cloudinary.com/dkl5uieu5/image/upload/v1761826913/ChatGPT_Image_14_jun_2025__01_19_57_a.m.-removebg-preview-removebg-preview_g13ukp.png';
export const LOGO_BG_URL = 'https://res.cloudinary.com/dkl5uieu5/image/upload/v1761826906/logonew-montedesion_ixejfe.jpg';

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: '¡Nueva Noticia!',
    message: 'Se ha publicado el cronograma del Campamento 2025.',
    type: 'system',
    is_read: false,
    created_at: '2025-06-15T12:00:00Z',
    content: 'Se ha publicado el cronograma del Campamento 2025.',
    related_id: null,
    user_id: 'u-current'
  },
  {
    id: 'n2',
    title: 'Reacción en Comunidad',
    message: 'A María Rodríguez le gustó tu devocional de hoy.',
    type: 'system',
    is_read: true,
    created_at: '2025-06-15T11:00:00Z',
    content: 'A María Rodríguez le gustó tu devocional de hoy.',
    related_id: null,
    user_id: 'u-current'
  }
];

export const MOCK_PRAYERS: PrayerRequest[] = [
  {
    id: 'pr1',
    userName: 'Anónimo',
    content: 'Pido oración por la salud de mi madre que se encuentra en un tratamiento delicado. Confiamos en la mano del Señor.',
    category: 'Salud',
    is_private: false,
    amenCount: 24,
    amen_count: 24,
    is_hidden: false,
    created_at: '2025-06-15T10:00:00Z',
    interaction_count: 24,
    user_has_interacted: false,
    audioUrl: null,
    duration: null,
    user_id: 'u1'
  },
  {
    id: 'pr2',
    userName: 'Ricardo M.',
    content: 'Doy gracias a Dios por abrir una puerta laboral después de meses de espera. ¡Su fidelidad es grande!',
    category: 'Gratitud',
    is_private: false,
    amenCount: 45,
    amen_count: 45,
    is_hidden: false,
    created_at: '2025-06-15T08:30:00Z',
    interaction_count: 45,
    user_has_interacted: false,
    audioUrl: null,
    duration: null,
    user_id: 'u2'
  },
  {
    id: 'pr3',
    userName: 'Elena P.',
    content: 'Intercesión por la restauración de mi hogar y la paz en mi familia.',
    category: 'Familia',
    is_private: false,
    amenCount: 18,
    amen_count: 18,
    is_hidden: false,
    created_at: '2025-06-14T20:00:00Z',
    interaction_count: 18,
    user_has_interacted: false,
    audioUrl: null,
    duration: null,
    user_id: 'u3'
  }
];

export const MOCK_STORIES: Story[] = [
  { id: 's1', userId: 'u1', userName: 'Sara', userAvatar: 'https://i.pravatar.cc/150?u=sara', mediaUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1000&auto=format&fit=crop', type: 'image', timestamp: '2h', created_at: '2025-06-15T10:00:00Z' },
  { id: 's2', userId: 'u2', userName: 'David', userAvatar: 'https://i.pravatar.cc/150?u=david', mediaUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop', type: 'image', timestamp: '4h', created_at: '2025-06-15T08:00:00Z' },
  { id: 's3', userId: 'u3', userName: 'Ruth', userAvatar: 'https://i.pravatar.cc/150?u=ruth', mediaUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=1000&auto=format&fit=crop', type: 'image', timestamp: '1h', created_at: '2025-06-15T11:00:00Z' },
  { id: 's4', userId: 'u4', userName: 'Juan', userAvatar: 'https://i.pravatar.cc/150?u=juan', mediaUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?q=80&w=1000&auto=format&fit=crop', type: 'image', timestamp: '30m', created_at: '2025-06-15T11:30:00Z' },
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    user_id: 'u1',
    userName: 'María Rodríguez',
    userAvatar: 'https://i.pravatar.cc/150?u=maria',
    content: '¡Qué bendición fue el servicio de hoy! La palabra sobre la perseverancia tocó mi corazón profundamente. 🙏✨',
    mediaUrl: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?q=80&w=2070&auto=format&fit=crop',
    media_url: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?q=80&w=2070&auto=format&fit=crop',
    media_type: 'image',
    likes: 124,
    comments: [],
    created_at: '2025-06-14T10:00:00Z',
    isLiked: false,
    is_hidden: false
  },
  {
    id: 'p2',
    user_id: 'u2',
    userName: 'Pr. Juan Montecinos',
    userAvatar: 'https://i.pravatar.cc/150?u=pjuan',
    content: 'Recuerden que la verdadera adoración no termina cuando el músico deja de tocar. Nuestra vida entera es un altar. ¡Los espero el miércoles en la noche de oración! #MonteDeSion #VidaDeFe',
    likes: 89,
    comments: [],
    created_at: '2025-06-14T15:30:00Z',
    media_url: null,
    media_type: null,
    isLiked: false,
    is_hidden: false
  }
];

export const MOCK_MINISTRIES: Ministry[] = [
  {
    id: 'm1',
    name: 'Alabanza',
    category: 'Artes Espirituales',
    color: 'amber',
    vision: 'Glorificar a Dios a través de la excelencia musical.',
    purpose: 'Dirigir a la congregación a la presencia del Señor.',
    activities: 'Ensayos semanales, servicios dominicales.',
    schedule: 'Jueves 7:00 PM | Domingos 8:00 AM',
    leaders: [
      { name: 'David Smith', role: 'Director de Alabanza', avatar: 'https://i.pravatar.cc/150?u=david' },
      { name: 'Sarah Evans', role: 'Vocal Leader', avatar: 'https://i.pravatar.cc/150?u=sarah' }
    ],
    heroImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop',
    hero_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop',
    leader_id: null,
    notes: '',
    leader_image_url: '',
    description: 'Ministerio de música y adoración.',
    created_at: '2025-06-15T10:00:00Z'
  },
  {
    id: 'm2',
    name: 'Jóvenes Sión',
    category: 'Nueva Generación',
    color: 'indigo',
    vision: 'Formar líderes con principios bíblicos y pasión por Cristo.',
    purpose: 'Crear un espacio de pertenencia y crecimiento para jóvenes.',
    activities: 'Células, eventos deportivos, campamentos.',
    schedule: 'Sábados 6:00 PM',
    leaders: [
      { name: 'Mateo Ruiz', role: 'Líder Juvenil', avatar: 'https://i.pravatar.cc/150?u=mateo' }
    ],
    heroImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop',
    hero_image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop',
    leader_id: null,
    notes: '',
    leader_image_url: '',
    description: 'Unidad de jóvenes para Cristo.',
    created_at: '2025-06-15T10:00:00Z'
  }
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'Campamento de Verano 2025',
    content: 'Estamos emocionados de anunciar el próximo campamento para toda la familia. Un tiempo de refrigerio espiritual y comunidad profunda.',
    imageUrl: 'https://images.unsplash.com/photo-1496080174650-637e3f22fa03?q=80&w=2000&auto=format&fit=crop',
    image_url: 'https://images.unsplash.com/photo-1496080174650-637e3f22fa03?q=80&w=2000&auto=format&fit=crop',
    created_at: '2025-06-15T10:00:00Z',
    priority: true,
    author: 'Pr. Juan Montecinos',
    category: 'Eventos'
  },
  {
    id: 'n2',
    title: 'Nueva Escuela de Discipulado',
    content: 'Comienzan las inscripciones para el nuevo ciclo de crecimiento espiritual. Una oportunidad para profundizar en la palabra.',
    imageUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=2000&auto=format&fit=crop',
    image_url: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=2000&auto=format&fit=crop',
    created_at: '2025-06-10T10:00:00Z',
    priority: false,
    author: 'Pra. Elena Montecinos',
    category: 'Educación'
  }
];

export const MOCK_EVENTS: EventItem[] = [
  {
    id: 'e1',
    title: 'Cumbre Global de Liderazgo',
    description: 'Un evento diseñado para equipar líderes con visión de Reino. Equipamiento práctico y profundo para el servicio.',
    date: '2025-06-22',
    time: '09:00 AM',
    location: 'Santuario Principal Sión, Av. Central 450',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012&auto=format&fit=crop',
    image_url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012&auto=format&fit=crop',
    priority: true,
    isFeatured: true,
    category: 'Taller',
    capacity: 200,
    created_at: '2025-06-15T10:00:00Z'
  }
];

export const MOCK_DEVOTIONALS: Devotional[] = [
  {
    id: 'd1',
    user_id: 'u-current',
    userName: 'Pr. Juan Montecinos',
    userAvatar: 'https://i.pravatar.cc/150?u=pjuan',
    title: 'Caminando sobre las Aguas',
    bible_verse: 'Mateo 14:29',
    bibleVerse: 'Mateo 14:29',
    content: 'La fe nos permite ver más allá de las circunstancias naturales. Cuando Pedro miró a Jesús, pudo caminar sobre el mar embravecido. Nuestra mirada determina nuestro nivel de paz.',
    created_at: '2025-06-16T07:00:00Z',
    is_hidden: false,
    audio_url: null
  }
];

export const MOCK_INSCRIPTIONS: Inscription[] = [
  {
    id: 'i1',
    userName: 'Roberto Gómez',
    userEmail: 'roberto@email.com',
    ministryName: 'Alabanza',
    status: 'pending',
    note: 'Toco la guitarra desde hace 5 años y quiero servir a Dios con mi talento.',
    created_at: '2025-06-15T10:00:00Z',
    ministry_id: 'm1',
    user_id: 'u1'
  }
];
