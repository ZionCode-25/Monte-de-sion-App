import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
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
        subtitle: '',
        content: '',
        image_url: '',
        category: 'General',
        priority: false
    });

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-2xl border-4 border-white/10 shadow-2xl my-8 mx-auto block max-w-full hover:scale-[1.02] transition-transform cursor-zoom-in'
                }
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-brand-primary underline decoration-brand-primary/30 underline-offset-4 font-bold'
                }
            }),
            Youtube.configure({
                controls: true,
                nocookie: true,
                allowFullscreen: true,
                HTMLAttributes: {
                    class: 'aspect-video w-full rounded-3xl shadow-2xl my-8 border-4 border-white/5 mx-auto'
                }
            }),
            Placeholder.configure({
                placeholder: 'Comienza a escribir la historia aquí...',
            }),
        ],
        content: newsForm.content,
        onUpdate: ({ editor }) => {
            setNewsForm(prev => ({ ...prev, content: editor.getHTML() }));
        },
        editorProps: {
            attributes: {
                class: 'focus:outline-none'
            }
        }
    }, [viewMode]);

    useEffect(() => {
        if (editor && newsForm.content !== editor.getHTML()) {
            // Solo actualizamos si el contenido es significativamente diferente (carga inicial)
            // para evitar interrupciones al escribir
            const currentHTML = editor.getHTML();
            if (newsForm.content !== currentHTML && !editor.isFocused) {
                editor.commands.setContent(newsForm.content || '');
            }
        }
    }, [newsForm.content, editor]);

    const resetForm = () => {
        setNewsForm({ title: '', subtitle: '', content: '', image_url: '', category: 'General', priority: false });
        editor?.commands.setContent('');
        setEditingNews(null);
        setMediaFile(null);
        setMediaPreview(null);
    };

    const handleEdit = (item: NewsItem) => {
        setEditingNews(item);
        setNewsForm({
            ...item,
            subtitle: item.subtitle || ''
        });
        editor?.commands.setContent(item.content || '');
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

    const addImageInline = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
                try {
                    triggerToast("Subiendo imagen...");
                    const url = await uploadImage(file);
                    if (url) {
                        editor?.chain().focus().setImage({ src: url }).run();
                        triggerToast("Imagen insertada");
                    }
                } catch (err) {
                    triggerToast("Error al subir imagen");
                }
            }
        };
        input.click();
    };

    const addVideoInline = () => {
        const url = prompt('Introduce la URL del video de YouTube:');
        if (url) {
            editor?.commands.setYoutubeVideo({
                src: url,
                width: 640,
                height: 360,
            });
        }
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

            // Ensure author_id is set if not present (for new news)
            const finalData = {
                ...newsForm,
                image_url: imgUrl,
                author_id: editingNews?.author_id || user?.id
            };

            await saveNewsMutation.mutateAsync(finalData);
            triggerToast(editingNews ? "Noticia actualizada" : "Noticia publicada");
            resetForm();
            setViewMode('list');
        } catch (error) {
            triggerToast("Error al guardar");
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const [showHelp, setShowHelp] = useState(false);

    const MenuBar = () => {
        if (!editor) return null;

        return (
            <div className="flex flex-wrap items-center gap-1 p-3 border-b border-brand-obsidian/5 dark:border-white/5 bg-brand-silk/30 dark:bg-black/20">
                <style>{`
                    .ProseMirror h1 { font-size: 2.5rem !important; font-weight: 800; line-height: 1.1; margin-bottom: 1.5rem; color: var(--brand-obsidian); }
                    .dark .ProseMirror h1 { color: white; }
                    .ProseMirror h2 { font-size: 1.5rem !important; font-weight: 700; line-height: 1.2; margin-bottom: 1rem; color: var(--brand-obsidian); opacity: 0.8; }
                    .dark .ProseMirror h2 { color: white; }
                    .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
                    .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
                    .ProseMirror blockquote { border-left: 4px solid #EAB308; padding-left: 1rem; font-style: italic; margin: 1.5rem 0; opacity: 0.8; }
                `}</style>
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${editor.isActive('bold') ? 'bg-brand-primary text-brand-obsidian' : 'hover:bg-brand-primary/20'}`}
                    title="Negrita"
                >
                    <span className="material-symbols-outlined text-xl">format_bold</span>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${editor.isActive('italic') ? 'bg-brand-primary text-brand-obsidian' : 'hover:bg-brand-primary/20'}`}
                    title="Itálica"
                >
                    <span className="material-symbols-outlined text-xl">format_italic</span>
                </button>
                <div className="w-[1px] h-6 bg-brand-obsidian/10 mx-1" />
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${editor.isActive('heading', { level: 1 }) ? 'bg-brand-primary text-brand-obsidian' : 'hover:bg-brand-primary/20'}`}
                    title="Título Principal"
                >
                    <span className="font-bold text-sm">H1</span>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-brand-primary text-brand-obsidian' : 'hover:bg-brand-primary/20'}`}
                    title="Subtítulo"
                >
                    <span className="font-bold text-sm">H2</span>
                </button>
                <div className="w-[1px] h-6 bg-brand-obsidian/10 mx-1" />
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${editor.isActive('bulletList') ? 'bg-brand-primary text-brand-obsidian' : 'hover:bg-brand-primary/20'}`}
                    title="Lista"
                >
                    <span className="material-symbols-outlined text-xl">format_list_bulleted</span>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${editor.isActive('orderedList') ? 'bg-brand-primary text-brand-obsidian' : 'hover:bg-brand-primary/20'}`}
                    title="Lista Numerada"
                >
                    <span className="material-symbols-outlined text-xl">format_list_numbered</span>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${editor.isActive('blockquote') ? 'bg-brand-primary text-brand-obsidian' : 'hover:bg-brand-primary/20'}`}
                    title="Cita / Destacado"
                >
                    <span className="material-symbols-outlined text-xl">format_quote</span>
                </button>
                <div className="w-[1px] h-6 bg-brand-obsidian/10 mx-1" />
                <button
                    onClick={addImageInline}
                    className="w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:bg-brand-primary/20"
                    title="Insertar Imagen"
                >
                    <span className="material-symbols-outlined text-xl">add_photo_alternate</span>
                </button>
                <button
                    onClick={addVideoInline}
                    className="w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:bg-brand-primary/20"
                    title="Insertar Video"
                >
                    <span className="material-symbols-outlined text-xl">smart_display</span>
                </button>
                <div className="flex-1" />
                <button
                    onClick={() => setShowHelp(true)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:bg-brand-primary/20 text-brand-primary"
                    title="Ayuda del Editor"
                >
                    <span className="material-symbols-outlined text-xl">help_outline</span>
                </button>
            </div>
        );
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
                        {viewMode === 'list' ? 'Redacta comunicados, devocionales y anuncios oficiales.' : 'Estás redactando una historia que impactará a la comunidad.'}
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
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center text-[8px] font-black border border-white dark:border-brand-obsidian overflow-hidden">
                                                        {item.userAvatar ? <img src={item.userAvatar} className="w-full h-full object-cover" /> : 'E'}
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{item.author || 'Editorial'}</span>
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
                                    {editingNews ? 'Editando' : 'Nueva Noticia'}
                                </span>
                                {editingNews && <span className="text-[10px] font-black opacity-40 uppercase tracking-widest truncate max-w-[200px]">{editingNews.title}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase opacity-30 tracking-widest">ID: {editingNews?.id?.split('-')[0] || '---'}</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto flex flex-col xl:flex-row">
                            {/* Editor Panel */}
                            <div className="w-full xl:w-[60%] p-6 md:p-10 space-y-10 custom-scrollbar overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Cover Image */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">image</span> Imagen de Portada Principal
                                        </label>
                                        <div className="aspect-[4/3] rounded-[2.5rem] bg-white dark:bg-white/5 border-2 border-dashed border-brand-obsidian/5 dark:border-white/5 overflow-hidden relative group cursor-pointer shadow-sm" onClick={() => document.getElementById('cover-input')?.click()}>
                                            {mediaPreview || newsForm.image_url ? (
                                                <SmartImage src={mediaPreview || newsForm.image_url || ''} className="w-full h-full object-cover" alt="Cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
                                                    <span className="material-symbols-outlined text-4xl mb-4">add_photo_alternate</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Subir Portada</span>
                                                </div>
                                            )}
                                            <input id="cover-input" type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                                        </div>
                                    </div>

                                    {/* Meta Fields */}
                                    <div className="space-y-8 flex flex-col justify-end">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Título de la Noticia</label>
                                            <input className="w-full bg-white dark:bg-white/5 p-6 rounded-[1.5rem] text-2xl font-serif font-bold border-none shadow-sm ring-1 ring-brand-obsidian/5 focus:ring-2 focus:ring-brand-primary transition-all" value={newsForm.title} onChange={e => setNewsForm({ ...newsForm, title: e.target.value })} placeholder="Ej: Nueva Gala de Adoración" />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Bajada / Subtítulo</label>
                                            <textarea className="w-full bg-white dark:bg-white/5 p-4 rounded-[1.5rem] text-sm font-medium border-none shadow-sm ring-1 ring-brand-obsidian/10 focus:ring-2 focus:ring-brand-primary transition-all h-24 resize-none" value={newsForm.subtitle} onChange={e => setNewsForm({ ...newsForm, subtitle: e.target.value })} placeholder="Un resumen impactante de la noticia..." />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1 mb-2 block">Categoría</label>
                                                <select className="w-full bg-white dark:bg-white/5 p-4 rounded-2xl font-bold text-xs" value={newsForm.category} onChange={e => setNewsForm({ ...newsForm, category: e.target.value })}>
                                                    <option value="General">General</option>
                                                    <option value="Evento">Evento</option>
                                                    <option value="Aviso">Aviso</option>
                                                    <option value="Devocional">Devocional</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1 mb-2 block">Prioridad</label>
                                                <button onClick={() => setNewsForm({ ...newsForm, priority: !newsForm.priority })} className={`w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${newsForm.priority ? 'bg-amber-500 text-brand-obsidian shadow-lg' : 'bg-white dark:bg-white/5 opacity-40'}`}>
                                                    {newsForm.priority ? '★ Destacada' : '☆ Normal'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rich Text Editor */}
                                <div className="space-y-4 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Cuerpo de la Noticia</label>
                                        <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">{newsForm.content?.length || 0} caracteres</span>
                                    </div>
                                    <div className="flex-1 bg-white dark:bg-brand-surface rounded-[2.5rem] overflow-hidden border border-brand-obsidian/5 dark:border-white/5 shadow-2xl flex flex-col min-h-[600px]">
                                        <MenuBar />
                                        <EditorContent
                                            editor={editor}
                                            className="flex-1 w-full p-10 font-serif text-xl leading-relaxed prose dark:prose-invert max-w-none focus:outline-none custom-scrollbar overflow-y-auto"
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Live Preview Panel (Realist) */}
                        <div className="hidden xl:block w-[40%] bg-white dark:bg-brand-obsidian border-l border-brand-obsidian/5 dark:border-white/5 overflow-y-auto custom-scrollbar">
                            <div className="p-4 bg-brand-silk/30 dark:bg-black/40 border-b border-brand-obsidian/5 dark:border-white/5 sticky top-0 z-20 backdrop-blur-md">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-center">Vista Previa Editorial</p>
                            </div>
                            <div className="p-12 space-y-12 animate-in fade-in duration-700">
                                <header className="space-y-6">
                                    <span className="px-4 py-1.5 bg-brand-primary text-brand-obsidian text-[10px] font-black uppercase tracking-widest rounded-full">{newsForm.category}</span>
                                    <h1 className="text-5xl font-serif font-bold text-brand-obsidian dark:text-white leading-[0.9] tracking-tighter">
                                        {newsForm.title || 'El Título de tu Historia'}
                                    </h1>
                                    {newsForm.subtitle && (
                                        <p className="text-xl font-serif font-medium text-brand-obsidian/60 dark:text-white/40 italic leading-relaxed">
                                            {newsForm.subtitle}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-3 pt-6 border-t border-brand-obsidian/5">
                                        <div className="w-10 h-10 rounded-xl bg-brand-primary/20 p-0.5"><img src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} className="w-full h-full object-cover rounded-lg" /></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest">{user?.user_metadata?.name || 'Mesa Editorial'}</p>
                                            <p className="text-[9px] opacity-30 font-bold uppercase tracking-widest">Hace un momento</p>
                                        </div>
                                    </div>
                                </header>

                                <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl">
                                    <img src={mediaPreview || newsForm.image_url || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65'} className="w-full h-full object-cover" />
                                </div>

                            <div className="prose dark:prose-invert max-w-none text-brand-obsidian/80 dark:text-white/70 font-serif leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: newsForm.content || '<p>Contenido en redacción...</p>' }} />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Modal Help */}
        {showHelp && (
            <div className="fixed inset-0 z-[6000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in" onClick={() => setShowHelp(false)}>
                <div className="bg-white dark:bg-brand-surface w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-3xl font-serif font-bold dark:text-white">Guía del <span className="text-brand-primary">Editor</span></h3>
                        <button onClick={() => setShowHelp(false)} className="w-12 h-12 rounded-2xl bg-brand-silk dark:bg-white/5 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </button>
                    </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary font-bold">H1</div>
                                    <p className="text-sm font-medium dark:text-white/70">**Título Grande**: Úsalo para encabezar secciones importantes.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary font-bold">H2</div>
                                    <p className="text-sm font-medium dark:text-white/70">**Subtítulo**: Ideal para separar párrafos de contenido.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary"><span className="material-symbols-outlined">format_quote</span></div>
                                    <p className="text-sm font-medium dark:text-white/70">**Cita**: Resalta frases o testimonios importantes.</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary"><span className="material-symbols-outlined">format_list_bulleted</span></div>
                                    <p className="text-sm font-medium dark:text-white/70">**Listas**: Para enumerar puntos o ítems.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary"><span className="material-symbols-outlined">add_photo_alternate</span></div>
                                    <p className="text-sm font-medium dark:text-white/70">**Imágenes**: Inserta imágenes dentro de la noticia.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary"><span className="material-symbols-outlined">smart_display</span></div>
                                    <p className="text-sm font-medium dark:text-white/70">**Video**: Pega un link de YouTube para incrustarlo.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10">
                            <p className="text-xs font-serif italic text-brand-obsidian/60 dark:text-white/60 text-center">
                                Tip: Selecciona cualquier texto para que aparezcan opciones de formato rápido.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNews;
