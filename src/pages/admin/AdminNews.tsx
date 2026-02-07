import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAdminNews } from '../../hooks/admin/useAdminNews';
import { NewsItem } from '../../types';
import { SmartImage } from '../../components/ui/SmartImage';

interface AdminNewsProps {
    user: any;
    uploadImage: (file: File) => Promise<string | null>;
    triggerToast: (msg: string) => void;
}

const AdminNews: React.FC<AdminNewsProps> = ({ user, uploadImage, triggerToast }) => {
    const { news, isLoading, saveNewsMutation, deleteNewsMutation, toggleNewsPriorityMutation } = useAdminNews(user, 'news');

    const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
    const [activeNewsTab, setActiveNewsTab] = useState<'editor' | 'preview'>('editor');
    const [isUploading, setIsUploading] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [newsForm, setNewsForm] = useState<Partial<NewsItem>>({
        title: '',
        content: '',
        image_url: '',
        category: 'General',
        priority: false
    });

    const resetForm = () => {
        setNewsForm({ title: '', content: '', image_url: '', category: 'General', priority: false });
        setEditingNews(null);
        setMediaFile(null);
        setMediaPreview(null);
    };

    const handleEdit = (item: NewsItem) => {
        setEditingNews(item);
        setNewsForm(item);
        setActiveNewsTab('editor'); // Switch to editor on mobile
    };

    const handleFileSelect = (file: File) => {
        if (file) {
            setMediaFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const insertFormatting = (prefix: string, suffix: string = '') => {
        const textarea = document.getElementById('news-content-editor') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = newsForm.content || '';
        const selectedText = text.substring(start, end);
        const before = text.substring(0, start);
        const after = text.substring(end);

        const newText = before + prefix + selectedText + suffix + after;
        setNewsForm({ ...newsForm, content: newText });

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };


    const handleSave = async () => {
        try {
            setIsUploading(true);
            let imgUrl = newsForm.image_url || '';

            if (mediaFile) {
                const up = await uploadImage(mediaFile);
                if (up) imgUrl = up;
            }

            await saveNewsMutation.mutateAsync({ ...newsForm, image_url: imgUrl });
            triggerToast(editingNews ? "Noticia actualizada" : "Noticia creada");
            resetForm();
        } catch (error) {
            triggerToast("Error al guardar noticia");
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-brand-bg dark:bg-black/90 text-brand-obsidian dark:text-white">
            {/* HEADER & ACTIONS */}
            <div className="flex-none p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-obsidian/5 dark:border-white/5">
                <div>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white leading-none tracking-tight">
                        Sala de Prensa
                    </h2>
                    <p className="mt-2 text-brand-obsidian/40 dark:text-white/40 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                        Gestiona las comunicaciones oficiales, devocionales y anuncios para toda la congregación.
                    </p>
                </div>
                <div className="flex gap-3 self-start md:self-auto">
                    <button
                        onClick={resetForm}
                        className="px-6 py-3 rounded-xl border border-brand-obsidian/10 hover:bg-brand-obsidian/5 transition-all text-sm font-bold uppercase tracking-widest"
                    >
                        Nueva
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col lg:flex-row">

                    {/* LEFT: LIST */}
                    <div className="w-full lg:w-96 flex-none border-r border-brand-obsidian/5 dark:border-white/5 bg-white dark:bg-brand-surface/50 overflow-y-auto">
                        <div className="p-4 space-y-3">
                            {isLoading ? (
                                <div className="text-center p-10 opacity-50">Cargando noticias...</div>
                            ) : news.length === 0 ? (
                                <div className="text-center p-10 opacity-50">No hay noticias.</div>
                            ) : (
                                news.map((item: NewsItem) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleEdit(item)}
                                        className={`group p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-lg relative overflow-hidden ${editingNews?.id === item.id ? 'bg-brand-primary text-brand-obsidian border-transparent shadow-xl transform scale-[1.02]' : 'bg-white dark:bg-brand-surface border-brand-obsidian/5 dark:border-white/5 hover:border-brand-primary/30'}`}
                                    >
                                        <div className="flex gap-4">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-brand-silk/50 dark:bg-black/20 flex-shrink-0">
                                                <SmartImage src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0 py-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {item.priority && <span className="material-symbols-outlined text-amber-500 text-[10px]" title="Destacado">star</span>}
                                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-50">{item.category}</span>
                                                </div>
                                                <h3 className={`font-serif font-bold leading-tight line-clamp-2 mb-2 ${editingNews?.id === item.id ? 'text-brand-obsidian' : 'text-brand-obsidian dark:text-white'}`}>
                                                    {item.title}
                                                </h3>
                                                <div className="flex items-center justify-between mt-auto">
                                                    <span className="text-[9px] opacity-40 font-medium italic">{new Date(item.created_at).toLocaleDateString()}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm('¿Eliminar esta noticia?')) deleteNewsMutation.mutate(item.id);
                                                        }}
                                                        className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT: EDITOR */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-brand-silk/30 dark:bg-black/20">

                        {/* Toolbar / Actions */}
                        <div className="p-4 border-b border-brand-obsidian/5 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-brand-surface/50 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-2">
                                <span className="bg-brand-primary/20 text-brand-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {editingNews ? 'Editando' : 'Creando'}
                                </span>
                                {editingNews && <span className="text-xs font-bold opacity-50 truncate max-w-[200px]">{editingNews.title}</span>}
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={isUploading || !newsForm.title}
                                className="px-6 py-2 bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian font-black text-[10px] uppercase tracking-[0.2em] rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isUploading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">save</span>}
                                {editingNews ? 'Actualizar' : 'Publicar'}
                            </button>
                        </div>

                        {/* Mobile Tabs */}
                        <div className="lg:hidden flex border-b border-brand-obsidian/5 dark:border-white/5 bg-white dark:bg-brand-surface">
                            <button
                                onClick={() => setActiveNewsTab('editor')}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest ${activeNewsTab === 'editor' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-obsidian/40 dark:text-white/40'}`}
                            >
                                Editor
                            </button>
                            <button
                                onClick={() => setActiveNewsTab('preview')}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest ${activeNewsTab === 'preview' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-obsidian/40 dark:text-white/40'}`}
                            >
                                Vista Previa
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto flex flex-col lg:flex-row">
                            {/* Inputs Area */}
                            <div className={`w-full lg:w-1/2 p-6 md:p-10 space-y-8 ${activeNewsTab === 'editor' ? 'block' : 'hidden lg:block'}`}>

                                {/* Cover Image */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Portada</label>
                                    <div
                                        className="aspect-video rounded-2xl bg-white dark:bg-brand-surface border-2 border-dashed border-brand-obsidian/10 dark:border-white/10 overflow-hidden relative group cursor-pointer"
                                        onClick={() => document.getElementById('cover-input')?.click()}
                                    >
                                        {mediaPreview || newsForm.image_url ? (
                                            <img src={mediaPreview || newsForm.image_url} className="w-full h-full object-cover" alt="Cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined text-4xl mb-2">add_photo_alternate</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Subir Imagen</span>
                                            </div>
                                        )}
                                        <input id="cover-input" type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                                    </div>
                                </div>

                                {/* Metadata Inputs */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Título</label>
                                        <input
                                            className="w-full bg-white dark:bg-brand-surface p-4 rounded-xl text-lg font-bold border-none ring-1 ring-brand-obsidian/5 focus:ring-2 focus:ring-brand-primary placeholder:opacity-30"
                                            placeholder="Título de la noticia..."
                                            value={newsForm.title}
                                            onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Categoría</label>
                                            <select
                                                className="w-full bg-white dark:bg-brand-surface p-3 rounded-xl font-bold border-none ring-1 ring-brand-obsidian/5 focus:ring-2 focus:ring-brand-primary"
                                                value={newsForm.category}
                                                onChange={e => setNewsForm({ ...newsForm, category: e.target.value })}
                                            >
                                                <option value="General">General</option>
                                                <option value="Evento">Evento</option>
                                                <option value="Aviso">Aviso</option>
                                                <option value="Urgente">Urgente</option>
                                                <option value="Editorial">Editorial</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Prioridad</label>
                                            <button
                                                onClick={() => setNewsForm({ ...newsForm, priority: !newsForm.priority })}
                                                className={`w-full p-3 rounded-xl font-bold flex items-center justify-between border-2 transition-all ${newsForm.priority ? 'border-amber-500 bg-amber-500/10 text-amber-600' : 'border-transparent bg-white dark:bg-brand-surface opacity-50'}`}
                                            >
                                                <span className="text-[10px] uppercase tracking-widest">{newsForm.priority ? 'Destacado' : 'Normal'}</span>
                                                <span className="material-symbols-outlined text-lg">{newsForm.priority ? 'star' : 'star_outline'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Video Relacionado (Opcional)</label>
                                        <div className="flex items-center gap-2 bg-white dark:bg-brand-surface p-3 rounded-xl ring-1 ring-brand-obsidian/5">
                                            <span className="material-symbols-outlined opacity-50">play_circle</span>
                                            <input
                                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium"
                                                placeholder="https://youtube.com/..."
                                                value={newsForm.video_url || ''}
                                                onChange={e => setNewsForm({ ...newsForm, video_url: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Content Editor */}
                                <div className="space-y-2 flex-1 flex flex-col">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Contenido</label>
                                    <div className="flex-1 bg-white dark:bg-brand-surface rounded-2xl overflow-hidden ring-1 ring-brand-obsidian/5 flex flex-col min-h-[400px]">
                                        <div className="flex items-center gap-2 p-2 border-b border-brand-obsidian/5 bg-brand-silk/50 dark:bg-white/5 overflow-x-auto">
                                            <button type="button" onClick={() => insertFormatting('**', '**')} className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors" title="Negrita"><span className="material-symbols-outlined text-lg">format_bold</span></button>
                                            <button type="button" onClick={() => insertFormatting('*', '*')} className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors" title="Cursiva"><span className="material-symbols-outlined text-lg">format_italic</span></button>
                                            <button type="button" onClick={() => insertFormatting('## ')} className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors" title="Subtítulo"><span className="material-symbols-outlined text-lg">format_h2</span></button>
                                            <button type="button" onClick={() => insertFormatting('- ')} className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors" title="Lista"><span className="material-symbols-outlined text-lg">format_list_bulleted</span></button>
                                            <button type="button" onClick={() => insertFormatting('> ')} className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors" title="Cita"><span className="material-symbols-outlined text-lg">format_quote</span></button>
                                        </div>
                                        <textarea
                                            id="news-content-editor"
                                            className="flex-1 w-full bg-transparent p-6 border-none focus:ring-0 resize-none font-serif text-lg leading-relaxed"
                                            placeholder="Escribe aquí... Markdown soportado."
                                            value={newsForm.content}
                                            onChange={e => setNewsForm({ ...newsForm, content: e.target.value })}
                                        />
                                    </div>
                                </div>

                            </div>

                            {/* Preview Area */}
                            <div className={`w-full lg:w-1/2 bg-white dark:bg-brand-obsidian border-l border-brand-obsidian/5 dark:border-white/5 overflow-y-auto p-8 md:p-12 ${activeNewsTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
                                <div className="max-w-2xl mx-auto space-y-8 opacity-90 pointer-events-none select-none">
                                    <div className="aspect-video rounded-[2rem] bg-brand-silk dark:bg-white/5 overflow-hidden shadow-2xl">
                                        <img
                                            src={mediaPreview || newsForm.image_url || 'https://via.placeholder.com/800x450?text=Vista+Previa'}
                                            className="w-full h-full object-cover"
                                            alt="Preview"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-brand-primary text-brand-obsidian text-[8px] font-black uppercase tracking-widest rounded-full">{newsForm.category}</span>
                                            <span className="text-[10px] opacity-40 uppercase font-bold tracking-widest">Hace un momento</span>
                                        </div>
                                        <h1 className="text-3xl md:text-5xl font-serif font-bold leading-[0.9] tracking-tighter text-brand-obsidian dark:text-white">
                                            {newsForm.title || 'Título de ejemplo'}
                                        </h1>
                                        <div className="prose dark:prose-invert max-w-none text-lg text-brand-obsidian/70 dark:text-brand-cream/80 font-serif leading-relaxed">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {newsForm.content || 'El contenido aparecerá aquí...'}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNews;
