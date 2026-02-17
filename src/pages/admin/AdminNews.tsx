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

        // Si no hay selección y es un prefijo de bloque (ej: '## '), poner al inicio de la línea
        let newText;
        let newCursorStart;

        if (!selectedText && prefix.endsWith(' ')) {
            // Find start of line
            const lastNewline = before.lastIndexOf('\n');
            const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
            const lineBefore = text.substring(0, lineStart);
            const lineAfter = text.substring(lineStart);
            newText = lineBefore + prefix + lineAfter;
            newCursorStart = lineStart + prefix.length;
        } else {
            newText = before + prefix + selectedText + suffix + after;
            newCursorStart = start + prefix.length;
        }

        setNewsForm(prev => ({ ...prev, content: newText }));

        setTimeout(() => {
            textarea.focus();
            if (selectedText) {
                textarea.setSelectionRange(newCursorStart, newCursorStart + selectedText.length);
            } else {
                textarea.setSelectionRange(newCursorStart, newCursorStart);
            }
        }, 10);
    };

    const handleSave = async () => {
        if (!newsForm.title) return;
        try {
            setIsUploading(true);
            let imgUrl = newsForm.image_url || '';

            if (mediaFile) {
                const up = await uploadImage(mediaFile);
                if (up) imgUrl = up;
            }

            await saveNewsMutation.mutateAsync({ ...newsForm, image_url: imgUrl });
            triggerToast(editingNews ? "Noticia actualizada con éxito" : "Noticia publicada con éxito");
            resetForm();
        } catch (error) {
            triggerToast("Error al procesar la noticia");
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F8F9FA] dark:bg-black/95 text-brand-obsidian dark:text-white">
            {/* HEADER & ACTIONS */}
            <div className="flex-none p-8 md:p-12 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white leading-none tracking-tight mb-2">
                        Sala de <span className="text-brand-primary">Prensa</span>
                    </h2>
                    <p className="text-brand-obsidian/40 dark:text-white/40 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                        Redacta comunicados, devocionales y anuncios oficiales.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={resetForm}
                        className="px-6 py-4 rounded-2xl bg-white dark:bg-white/5 border border-brand-obsidian/5 dark:border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-brand-obsidian transition-all group"
                    >
                        <span className="material-symbols-outlined text-sm inline-block translate-y-0.5 mr-2">add</span>
                        Nueva Entrada
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isUploading || !newsForm.title}
                        className="bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 flex items-center gap-3"
                    >
                        {isUploading ? (
                            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-sm">publish</span>
                        )}
                        {editingNews ? 'Guardar Cambios' : 'Publicar Ahora'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col lg:flex-row">

                    {/* LEFT: LIST */}
                    <div className="w-full lg:w-96 flex-none border-r border-brand-obsidian/5 dark:border-white/5 bg-white dark:bg-brand-surface/50 overflow-y-auto scrollbar-hide">
                        <div className="p-6 space-y-4">
                            {isLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center opacity-40">
                                    <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando...</span>
                                </div>
                            ) : news.length === 0 ? (
                                <div className="py-20 text-center opacity-30 italic font-serif">No hay noticias publicadas.</div>
                            ) : (
                                news.map((item: NewsItem) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleEdit(item)}
                                        className={`group p-5 rounded-[2rem] border transition-all duration-300 cursor-pointer relative overflow-hidden ${editingNews?.id === item.id ? 'bg-white dark:bg-brand-surface border-brand-primary shadow-2xl ring-1 ring-brand-primary' : 'bg-transparent border-brand-obsidian/5 dark:border-white/5 hover:border-brand-primary/30 hover:bg-white dark:hover:bg-brand-surface/80 shadow-sm'}`}
                                    >
                                        <div className="flex gap-4">
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-silk/50 dark:bg-black/20 flex-shrink-0 shadow-inner">
                                                <SmartImage src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col py-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {item.priority && <span className="material-symbols-outlined text-amber-500 text-[14px] fill-1">star</span>}
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${editingNews?.id === item.id ? 'text-brand-primary' : 'opacity-40'}`}>{item.category}</span>
                                                </div>
                                                <h3 className={`font-serif font-bold text-lg leading-[1.1] line-clamp-2 mb-3 ${editingNews?.id === item.id ? 'text-brand-obsidian dark:text-white' : 'text-brand-obsidian/80 dark:text-white/80'}`}>
                                                    {item.title}
                                                </h3>
                                                <div className="mt-auto flex items-center justify-between">
                                                    <span className="text-[9px] opacity-30 font-bold uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm('¿Eliminar esta noticia?')) deleteNewsMutation.mutate(item.id);
                                                        }}
                                                        className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">delete</span>
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
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Imagen de Portada</label>
                                        <span className="text-[9px] font-bold opacity-30 italic">Recomendado: 16:9</span>
                                    </div>
                                    <div 
                                        className="aspect-video rounded-[2.5rem] bg-white dark:bg-white/5 border-2 border-dashed border-brand-obsidian/5 dark:border-white/5 overflow-hidden relative group cursor-pointer hover:border-brand-primary/50 transition-all duration-500 shadow-sm"
                                        onClick={() => document.getElementById('cover-input')?.click()}
                                    >
                                        {mediaPreview || newsForm.image_url ? (
                                            <>
                                                <img src={mediaPreview || newsForm.image_url} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt="Cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                    <div className="bg-white text-brand-obsidian p-4 rounded-full shadow-2xl">
                                                        <span className="material-symbols-outlined text-2xl">edit</span>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 group-hover:opacity-100 group-hover:bg-brand-primary/5 transition-all">
                                                <div className="w-20 h-20 rounded-full bg-brand-obsidian/5 dark:bg-white/5 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                                                    <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Seleccionar Imagen</span>
                                            </div>
                                        )}
                                        <input id="cover-input" type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                                    </div>
                                </div>

                                {/* Metadata Inputs */}
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Título de la Noticia</label>
                                        <input
                                            className="w-full bg-white dark:bg-white/5 p-6 rounded-[1.5rem] text-2xl font-serif font-bold border-none shadow-sm ring-1 ring-brand-obsidian/5 focus:ring-2 focus:ring-brand-primary transition-all placeholder:opacity-20 scrollbar-hide"
                                            placeholder="Ej: Gran Conferencia de Avivamiento"
                                            value={newsForm.title}
                                            onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Sección</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full bg-white dark:bg-white/5 p-4 rounded-2xl font-bold text-sm border-none shadow-sm ring-1 ring-brand-obsidian/5 focus:ring-2 focus:ring-brand-primary appearance-none"
                                                    value={newsForm.category}
                                                    onChange={e => setNewsForm({ ...newsForm, category: e.target.value })}
                                                >
                                                    <option value="General">General</option>
                                                    <option value="Evento">Evento</option>
                                                    <option value="Aviso">Aviso</option>
                                                    <option value="Urgente">Urgente</option>
                                                    <option value="Editorial">Editorial</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none">unfold_more</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Estado de Importancia</label>
                                            <button
                                                onClick={() => setNewsForm({ ...newsForm, priority: !newsForm.priority })}
                                                className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 border transition-all duration-500 ${newsForm.priority ? 'bg-amber-500 border-amber-400 text-brand-obsidian shadow-lg shadow-amber-500/20' : 'bg-white dark:bg-white/5 border-brand-obsidian/5 dark:border-white/5 opacity-40'}`}
                                            >
                                                <span className="material-symbols-outlined text-lg">{newsForm.priority ? 'star' : 'star_border'}</span>
                                                {newsForm.priority ? 'Noticia Destacada' : 'Prioridad Normal'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Enlace a Video (YouTube)</label>
                                        <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-4 rounded-2xl shadow-sm ring-1 ring-brand-obsidian/5 focus-within:ring-2 focus-within:ring-brand-primary transition-all">
                                            <span className="material-symbols-outlined opacity-30">movie</span>
                                            <input
                                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:opacity-20"
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                value={newsForm.video_url || ''}
                                                onChange={e => setNewsForm({ ...newsForm, video_url: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Content Editor */}
                                <div className="space-y-4 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Contenido Editorial</label>
                                        <span className="text-[9px] font-bold opacity-30 italic">Markdown soportado</span>
                                    </div>
                                    <div className="flex-1 bg-white dark:bg-white/5 rounded-[2rem] overflow-hidden border border-brand-obsidian/5 dark:border-white/5 flex flex-col min-h-[500px] shadow-sm focus-within:ring-2 focus-within:ring-brand-primary/30 transition-all">
                                        <div className="flex items-center gap-1 p-3 border-b border-brand-obsidian/5 dark:border-white/5 bg-brand-silk/30 dark:bg-black/20 overflow-x-auto scrollbar-hide">
                                            <button type="button" onClick={() => insertFormatting('**', '**')} className="w-10 h-10 flex items-center justify-center hover:bg-brand-primary hover:text-brand-obsidian rounded-xl transition-all" title="Negrita">
                                                <span className="material-symbols-outlined text-xl">format_bold</span>
                                            </button>
                                            <button type="button" onClick={() => insertFormatting('*', '*')} className="w-10 h-10 flex items-center justify-center hover:bg-brand-primary hover:text-brand-obsidian rounded-xl transition-all" title="Cursiva">
                                                <span className="material-symbols-outlined text-xl">format_italic</span>
                                            </button>
                                            <div className="w-px h-6 bg-brand-obsidian/10 dark:mx-2" />
                                            <button type="button" onClick={() => insertFormatting('## ')} className="w-10 h-10 flex items-center justify-center hover:bg-brand-primary hover:text-brand-obsidian rounded-xl transition-all" title="Título">
                                                <span className="material-symbols-outlined text-xl">format_h2</span>
                                            </button>
                                            <button type="button" onClick={() => insertFormatting('- ')} className="w-10 h-10 flex items-center justify-center hover:bg-brand-primary hover:text-brand-obsidian rounded-xl transition-all" title="Lista">
                                                <span className="material-symbols-outlined text-xl">format_list_bulleted</span>
                                            </button>
                                            <button type="button" onClick={() => insertFormatting('> ')} className="w-10 h-10 flex items-center justify-center hover:bg-brand-primary hover:text-brand-obsidian rounded-xl transition-all" title="Cita">
                                                <span className="material-symbols-outlined text-xl">format_quote</span>
                                            </button>
                                            <button type="button" onClick={() => insertFormatting('[', '](url)')} className="w-10 h-10 flex items-center justify-center hover:bg-brand-primary hover:text-brand-obsidian rounded-xl transition-all" title="Link">
                                                <span className="material-symbols-outlined text-xl">link</span>
                                            </button>
                                        </div>
                                        <textarea
                                            id="news-content-editor"
                                            className="flex-1 w-full bg-transparent p-8 border-none focus:ring-0 resize-none font-serif text-lg leading-relaxed dark:text-white/90 placeholder:opacity-20 scrollbar-hide"
                                            placeholder="Comienza a escribir la historia..."
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
                                            src={mediaPreview || newsForm.image_url || 'https://placehold.co/800x450?text=Vista+Previa'}
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
                                        <div className="prose dark:prose-invert max-w-none text-lg text-brand-obsidian/70 dark:text-brand-cream/80 font-serif leading-relaxed
                                            [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-4 [&_h2]:text-brand-obsidian dark:[&_h2]:text-white
                                            [&_p]:mb-4
                                            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4
                                            [&_li]:mb-1
                                            [&_strong]:font-black [&_strong]:text-brand-obsidian dark:[&_strong]:text-white
                                            [&_blockquote]:border-l-4 [&_blockquote]:border-brand-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-6">
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
