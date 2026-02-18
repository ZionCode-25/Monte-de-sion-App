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
    const { news, isLoading, saveNewsMutation, deleteNewsMutation } = useAdminNews(user, 'news');

    const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
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
        setViewMode('editor');
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

        let newText;
        let newCursorStart;

        if (!selectedText && prefix.endsWith(' ')) {
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
            setViewMode('list');
        } catch (error) {
            triggerToast("Error al procesar la noticia");
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F8F9FA] dark:bg-black/95 text-brand-obsidian dark:text-white">
            <div className="flex-none p-8 md:p-12 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        {viewMode === 'editor' && (
                            <button 
                                onClick={() => { setViewMode('list'); resetForm(); }}
                                className="w-10 h-10 rounded-full bg-brand-silk dark:bg-white/5 flex items-center justify-center hover:bg-brand-primary hover:text-brand-obsidian transition-all"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                        )}
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-obsidian dark:text-white leading-none tracking-tight">
                            Sala de <span className="text-brand-primary">Prensa</span>
                        </h2>
                    </div>
                    <p className="text-brand-obsidian/40 dark:text-white/40 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                        Redacta comunicados, devocionales y anuncios oficiales.
                    </p>
                </div>
                <div className="flex gap-3">
                    {viewMode === 'list' ? (
                        <button
                            onClick={() => { resetForm(); setViewMode('editor'); }}
                            className="bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all flex items-center gap-3"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Nueva Entrada
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={isUploading || !newsForm.title}
                            className="bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all disabled:opacity-30 flex items-center gap-3"
                        >
                            {isUploading ? (
                                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                            ) : (
                                <span className="material-symbols-outlined text-sm">publish</span>
                            )}
                            {editingNews ? 'Guardar Cambios' : 'Publicar Ahora'}
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {viewMode === 'list' ? (
                    <div className="h-full overflow-y-auto p-8 md:p-12 pt-0 scrollbar-hide">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center opacity-40">
                                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
                                <span className="text-xs font-black uppercase tracking-[0.2em]">Sincronizando Archivo...</span>
                            </div>
                        ) : news.length === 0 ? (
                            <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-brand-obsidian/5 dark:border-white/5 rounded-[4rem] opacity-30">
                                <span className="material-symbols-outlined text-7xl mb-6 font-light">newspaper</span>
                                <p className="text-2xl font-serif italic">Todavía no has publicado ninguna historia.</p>
                                <button
                                    onClick={() => setViewMode('editor')}
                                    className="mt-8 text-brand-primary font-black uppercase text-[10px] tracking-widest hover:underline"
                                >
                                    Escribir mi primera noticia
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                                {news.map((item: NewsItem) => (
                                    <div
                                        key={item.id}
                                        onClick={() => { handleEdit(item); }}
                                        className="group bg-white dark:bg-brand-surface rounded-[3rem] border border-brand-obsidian/5 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-[400px] cursor-pointer"
                                    >
                                        <div className="h-48 overflow-hidden relative">
                                            <SmartImage src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                                            <div className="absolute top-6 right-6 flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('¿Eliminar esta noticia?')) deleteNewsMutation.mutate(item.id);
                                                    }}
                                                    className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-rose-500 transition-all flex items-center justify-center shadow-lg"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                            {item.priority && (
                                                <div className="absolute top-6 left-6 px-4 py-1.5 bg-amber-500 rounded-full flex items-center gap-2 shadow-lg scale-90 -translate-x-1 -translate-y-1">
                                                    <span className="material-symbols-outlined text-brand-obsidian text-[14px]">star</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-obsidian">Destacado</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-8 flex flex-col flex-1">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary">{item.category}</span>
                                                <div className="w-1 h-1 rounded-full bg-brand-obsidian/20 dark:bg-white/20" />
                                                <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="text-xl font-serif font-bold text-brand-obsidian dark:text-white line-clamp-2 leading-tight mb-4 group-hover:text-brand-primary transition-colors">
                                                {item.title}
                                            </h3>
                                            <div className="mt-auto flex items-center justify-between pt-6 border-t border-brand-obsidian/5 dark:border-white/5">
                                                <div className="flex -space-x-2">
                                                    <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center text-[8px] font-black border border-white dark:border-brand-obsidian">M</div>
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[8px] font-black border border-white dark:border-brand-obsidian">S</div>
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-100 transition-all flex items-center gap-2">
                                                    Editar <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col lg:flex-row bg-brand-silk/30 dark:bg-black/20 overflow-hidden">
                        <div className="p-4 border-b border-brand-obsidian/5 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-brand-surface/50 backdrop-blur-md sticky top-0 z-10 w-full shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="bg-brand-primary/20 text-brand-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {editingNews ? 'Editando' : 'Creando'}
                                </span>
                                {editingNews && <span className="text-xs font-bold opacity-50 truncate max-w-[200px]">{editingNews.title}</span>}
                            </div>
                        </div>

                        <div className="lg:hidden flex border-b border-brand-obsidian/5 dark:border-white/5 bg-white dark:bg-brand-surface shrink-0">
                            <button onClick={() => setActiveNewsTab('editor')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest ${activeNewsTab === 'editor' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-obsidian/40 dark:text-white/40'}`}>Editor</button>
                            <button onClick={() => setActiveNewsTab('preview')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest ${activeNewsTab === 'preview' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-brand-obsidian/40 dark:text-white/40'}`}>Vista Previa</button>
                        </div>

                        <div className="flex-1 overflow-auto flex flex-col lg:flex-row">
                            <div className={`w-full lg:w-1/2 p-6 md:p-10 space-y-8 ${activeNewsTab === 'editor' ? 'block' : 'hidden lg:block'}`}>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Imagen de Portada</label>
                                    <div className="aspect-video rounded-[2.5rem] bg-white dark:bg-white/5 border-2 border-dashed border-brand-obsidian/5 dark:border-white/5 overflow-hidden relative group cursor-pointer shadow-sm" onClick={() => document.getElementById('cover-input')?.click()}>
                                        {mediaPreview || newsForm.image_url ? (
                                            <SmartImage src={mediaPreview || newsForm.image_url || ''} className="w-full h-full object-cover" alt="Cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
                                                <span className="material-symbols-outlined text-4xl mb-4">add_photo_alternate</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Seleccionar Imagen</span>
                                            </div>
                                        )}
                                        <input id="cover-input" type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Título</label>
                                        <input className="w-full bg-white dark:bg-white/5 p-6 rounded-[1.5rem] text-2xl font-serif font-bold border-none shadow-sm ring-1 ring-brand-obsidian/5 focus:ring-2 focus:ring-brand-primary transition-all" value={newsForm.title} onChange={e => setNewsForm({ ...newsForm, title: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <select className="bg-white dark:bg-white/5 p-4 rounded-2xl font-bold text-sm" value={newsForm.category} onChange={e => setNewsForm({ ...newsForm, category: e.target.value })}>
                                            <option value="General">General</option>
                                            <option value="Evento">Evento</option>
                                            <option value="Aviso">Aviso</option>
                                        </select>
                                        <button onClick={() => setNewsForm({ ...newsForm, priority: !newsForm.priority })} className={`p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest ${newsForm.priority ? 'bg-amber-500 text-brand-obsidian' : 'bg-white dark:bg-white/5 opacity-40'}`}>
                                            {newsForm.priority ? '★ Destacada' : '☆ Normal'}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Contenido</label>
                                    </div>
                                    <div className="flex-1 bg-white dark:bg-white/5 rounded-[2rem] overflow-hidden border border-brand-obsidian/5 dark:border-white/5 flex flex-col min-h-[500px]">
                                        <div className="flex items-center gap-1 p-3 border-b border-brand-obsidian/5 dark:border-white/5 bg-brand-silk/30 dark:bg-black/20">
                                            <button type="button" onClick={() => insertFormatting('**', '**')} className="w-10 h-10 flex items-center justify-center hover:bg-brand-primary rounded-xl transition-all">B</button>
                                            <button type="button" onClick={() => insertFormatting('*', '*')} className="w-10 h-10 flex items-center justify-center hover:bg-brand-primary rounded-xl transition-all">I</button>
                                        </div>
                                        <textarea id="news-content-editor" className="flex-1 w-full bg-transparent p-8 border-none focus:ring-0 resize-none font-serif text-lg leading-relaxed" value={newsForm.content} onChange={e => setNewsForm({ ...newsForm, content: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className={`w-full lg:w-1/2 bg-white dark:bg-brand-obsidian border-l border-brand-obsidian/5 dark:border-white/5 overflow-y-auto p-8 md:p-12 ${activeNewsTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
                                <div className="max-w-2xl mx-auto space-y-8">
                                    <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight">{newsForm.title || 'Título'}</h1>
                                    <div className="prose dark:prose-invert max-w-none text-lg font-serif italic opacity-80">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{newsForm.content || 'Contenido...'}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminNews;
