import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '../../lib/supabase';
import { Credential, CredentialCategory, CredentialStatus, User } from '../../types';
import { LOGO_LIGHT_THEME, LOGO_DARK_THEME } from '../../constants';

interface AdminCredentialsProps {
  user: User | null;
  triggerToast: (msg: string) => void;
  uploadImage?: (file: File) => Promise<string | null>;
}

export const AdminCredentials: React.FC<AdminCredentialsProps> = ({
  user,
  triggerToast,
  uploadImage,
}) => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [selectedForCard, setSelectedForCard] = useState<Credential | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    full_name: '',
    role_title: '',
    category: 'PASTORAL' as CredentialCategory,
    status: 'active' as CredentialStatus,
    issue_date: new Date().toISOString().split('T')[0],
    expiration_date: '',
    photo_url: '',
    location: 'San Juan, Argentina',
    document_number: '',
    notes: '',
  });

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching credentials:', error);
        triggerToast('Error al cargar credenciales');
      } else {
        setCredentials((data as Credential[]) || []);
      }
    } catch (err) {
      console.error(err);
      triggerToast('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const openNewForm = () => {
    // Generate suggested code based on highest number
    let nextNum = 1;
    credentials.forEach((c) => {
      const match = c.code.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num >= nextNum) nextNum = num + 1;
      }
    });
    const suggestedCode = `PM-${String(nextNum).padStart(5, '0')}`;

    setEditingCredential(null);
    setFormData({
      code: suggestedCode,
      full_name: '',
      role_title: 'Pastora Principal',
      category: 'PASTORAL',
      status: 'active',
      issue_date: new Date().toISOString().split('T')[0],
      expiration_date: new Date(new Date().setFullYear(new Date().getFullYear() + 2))
        .toISOString()
        .split('T')[0],
      photo_url: '',
      location: 'San Juan, Argentina',
      document_number: '',
      notes: '',
    });
    setIsFormOpen(true);
  };

  const openEditForm = (cred: Credential) => {
    setEditingCredential(cred);
    setFormData({
      code: cred.code,
      full_name: cred.full_name,
      role_title: cred.role_title,
      category: cred.category as CredentialCategory,
      status: cred.status,
      issue_date: cred.issue_date || new Date().toISOString().split('T')[0],
      expiration_date: cred.expiration_date || '',
      photo_url: cred.photo_url || '',
      location: cred.location || 'San Juan, Argentina',
      document_number: cred.document_number || '',
      notes: cred.notes || '',
    });
    setIsFormOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadImage) {
      setUploadingPhoto(true);
      const url = await uploadImage(file);
      setUploadingPhoto(false);
      if (url) {
        setFormData((prev) => ({ ...prev, photo_url: url }));
        triggerToast('Foto subida correctamente');
      }
    } else {
      // Direct Supabase storage fallback
      try {
        setUploadingPhoto(true);
        const ext = file.name.split('.').pop();
        const fileName = `credential_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`credentials/${fileName}`, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('avatars').getPublicUrl(`credentials/${fileName}`);
        setFormData((prev) => ({ ...prev, photo_url: data.publicUrl }));
        triggerToast('Foto subida');
      } catch (error) {
        console.error(error);
        triggerToast('Error al subir la imagen');
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.full_name.trim() || !formData.role_title.trim()) {
      triggerToast('Completa los campos obligatorios');
      return;
    }

    const payload = {
      code: formData.code.trim().toUpperCase(),
      full_name: formData.full_name.trim(),
      role_title: formData.role_title.trim(),
      category: formData.category,
      status: formData.status,
      issue_date: formData.issue_date,
      expiration_date: formData.expiration_date || null,
      photo_url: formData.photo_url || null,
      location: formData.location.trim() || 'San Juan, Argentina',
      document_number: formData.document_number.trim() || null,
      notes: formData.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingCredential) {
        const { error } = await supabase
          .from('credentials')
          .update(payload)
          .eq('id', editingCredential.id);

        if (error) throw error;
        triggerToast('Credencial actualizada con éxito');
      } else {
        const { error } = await supabase.from('credentials').insert([payload]);
        if (error) throw error;
        triggerToast('Nueva credencial emitida exitosamente');
      }

      setIsFormOpen(false);
      fetchCredentials();
    } catch (err: any) {
      console.error(err);
      if (err.code === '23505') {
        triggerToast('Ya existe una credencial con este código');
      } else {
        triggerToast('Error al guardar credencial');
      }
    }
  };

  const handleDelete = async (cred: Credential) => {
    if (!confirm(`¿Estás seguro de eliminar la credencial ${cred.code} de ${cred.full_name}?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('credentials').delete().eq('id', cred.id);
      if (error) throw error;
      triggerToast('Credencial eliminada');
      setCredentials((prev) => prev.filter((c) => c.id !== cred.id));
      if (selectedForCard?.id === cred.id) setSelectedForCard(null);
    } catch (err) {
      console.error(err);
      triggerToast('Error al eliminar');
    }
  };

  const downloadQRCode = (code: string) => {
    const canvas = document.getElementById(`qr-card-${code}`) as HTMLCanvasElement;
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_Credencial_${code}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    triggerToast('Código QR descargado');
  };

  const copyVerificationLink = (code: string) => {
    const origin = window.location.origin;
    const url = `${origin}/verificar/${code}`;
    navigator.clipboard.writeText(url);
    triggerToast('Enlace de verificación copiado al portapapeles');
  };

  // Filtered list
  const filteredCredentials = credentials.filter((cred) => {
    const matchesSearch =
      cred.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cred.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cred.role_title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || cred.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || cred.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>Credenciales & Carnets</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-bold uppercase tracking-wider">
              {credentials.length} Emitidas
            </span>
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Control oficial, emisión y generación de códigos QR de verificación para pastores y ministros.
          </p>
        </div>

        <button
          onClick={openNewForm}
          className="px-5 py-3 rounded-2xl bg-brand-primary text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 cursor-pointer self-start sm:self-auto"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Emitir Credencial</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, código o cargo..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-primary shadow-xs"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-primary shadow-xs font-medium"
        >
          <option value="all">Todos los Estados</option>
          <option value="active">🟢 Vigentes / Activas</option>
          <option value="expired">🟡 Vencidas</option>
          <option value="revoked">🔴 Revocadas / Anuladas</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-primary shadow-xs font-medium"
        >
          <option value="all">Todas las Categorías</option>
          <option value="PASTORAL">Pastoral</option>
          <option value="MINISTERIAL">Ministerial</option>
          <option value="LIDERAZGO">Liderazgo</option>
          <option value="OBRERO">Obrero</option>
        </select>
      </div>

      {/* List / Cards */}
      {loading ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-500">Cargando credenciales oficiales...</p>
        </div>
      ) : filteredCredentials.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 mx-auto flex items-center justify-center text-slate-400 mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-800 dark:text-zinc-200">No se encontraron credenciales</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Intentá con otro término de búsqueda o emití una nueva credencial.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCredentials.map((cred) => {
            const isRevoked = cred.status === 'revoked';
            const today = new Date().toISOString().split('T')[0];
            const isExpired = cred.status === 'expired' || (cred.expiration_date && cred.expiration_date < today);

            return (
              <div
                key={cred.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar: Code & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 tracking-wider">
                      {cred.code}
                    </span>

                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isRevoked
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                          : isExpired
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {isRevoked ? 'Revocada' : isExpired ? 'Vencida' : 'Vigente'}
                    </span>
                  </div>

                  {/* Holder info */}
                  <div className="flex items-center gap-3.5">
                    {cred.photo_url ? (
                      <img
                        src={cred.photo_url}
                        alt={cred.full_name}
                        className="w-13 h-13 rounded-xl object-cover border border-slate-200 dark:border-zinc-700 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-13 h-13 rounded-xl bg-gradient-to-tr from-brand-primary to-amber-500 flex items-center justify-center text-white text-lg font-bold shadow-xs shrink-0">
                        {cred.full_name.charAt(0)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white truncate">
                        {cred.full_name}
                      </h4>
                      <p className="text-xs font-semibold text-brand-primary truncate">
                        {cred.role_title}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                        {cred.category} • {cred.location || 'San Juan'}
                      </p>
                      {cred.document_number && (
                        <p className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                          DNI: {cred.document_number}
                        </p>
                      )}
                    </div>
                  </div>


                  {/* Expiration date */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                    <span>Vencimiento:</span>
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      {cred.expiration_date ? cred.expiration_date : 'Sin límite'}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                  <button
                    onClick={() => setSelectedForCard(cred)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-all cursor-pointer shadow-xs"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <span>Ver QR / Carnet</span>
                  </button>

                  <button
                    onClick={() => openEditForm(cred)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-all cursor-pointer"
                    title="Editar datos"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleDelete(cred)}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 transition-all cursor-pointer"
                    title="Eliminar credencial"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Formulario de Emisión / Edición */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingCredential ? 'Editar Credencial' : 'Emitir Nueva Credencial'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Código Oficial *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="PM-00125"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-mono uppercase font-bold focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CredentialCategory })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="PASTORAL">Pastoral</option>
                    <option value="MINISTERIAL">Ministerial</option>
                    <option value="LIDERAZGO">Liderazgo</option>
                    <option value="OBRERO">Obrero</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Nombre Completo del Portador *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Ej. Marcela Arroyo"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Cargo / Título Ministerial *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role_title}
                    onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                    placeholder="Ej. Pastora Principal / Ministro"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Estado de la Credencial
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CredentialStatus })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="active">🟢 Activa / Vigente</option>
                    <option value="expired">🟡 Vencida</option>
                    <option value="revoked">🔴 Revocada / Anulada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Fecha de Emisión
                  </label>
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    value={formData.expiration_date}
                    onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              {/* Foto */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Foto del Portador (Opcional)
                </label>
                <div className="flex items-center gap-3">
                  {formData.photo_url ? (
                    <img
                      src={formData.photo_url}
                      alt="Vista previa"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-zinc-700"
                    />
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer"
                  />
                  {uploadingPhoto && <span className="text-xs text-brand-primary animate-pulse">Subiendo...</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Ubicación / Jurisdicción
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="San Juan, Argentina"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    DNI / Documento (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.document_number}
                    onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                    placeholder="Para registro interno"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Observaciones / Notas
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Detalles ministeriales o notas internas..."
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-brand-primary text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 shadow-lg shadow-brand-primary/20"
                >
                  {editingCredential ? 'Guardar Cambios' : 'Emitir Credencial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Visualización de QR & Carnet Digital */}
      {selectedForCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Carnet & Código QR Oficial
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {selectedForCard.full_name} • {selectedForCard.code}
                </p>
              </div>
              <button
                onClick={() => setSelectedForCard(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Vista Previa del Carnet Digital */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-zinc-900 to-black text-white border border-amber-500/30 shadow-2xl relative overflow-hidden">
              {/* Marca de agua / Brillo institucional */}
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Encabezado del Carnet */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <img src={LOGO_LIGHT_THEME} alt="Logo" className="w-8 h-8 object-contain" />
                  <div>
                    <h5 className="text-xs font-black tracking-wider uppercase text-amber-400 leading-tight">
                      Iglesia Monte de Sion
                    </h5>
                    <p className="text-[9px] text-zinc-400 tracking-tight">San Juan - Argentina</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {selectedForCard.category}
                  </span>
                </div>
              </div>

              {/* Cuerpo del Carnet */}
              <div className="flex items-center gap-4">
                {selectedForCard.photo_url ? (
                  <img
                    src={selectedForCard.photo_url}
                    alt={selectedForCard.full_name}
                    className="w-20 h-24 rounded-xl object-cover border-2 border-amber-400/60 shadow-lg shrink-0"
                  />
                ) : (
                  <div className="w-20 h-24 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shrink-0">
                    {selectedForCard.full_name.charAt(0)}
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-lg font-black text-white leading-tight truncate">
                    {selectedForCard.full_name}
                  </h4>
                  <p className="text-xs font-bold text-amber-400 truncate">
                    {selectedForCard.role_title}
                  </p>
                  <p className="text-[11px] font-mono font-bold text-zinc-300 pt-1">
                    Nº: {selectedForCard.code}
                  </p>
                  {selectedForCard.document_number && (
                    <p className="text-[10px] font-mono text-zinc-400">
                      DNI: {selectedForCard.document_number}
                    </p>
                  )}
                  <p className="text-[10px] text-zinc-400">
                    Vigencia: {selectedForCard.expiration_date || 'Indefinida'}
                  </p>

                </div>

                {/* QR en el Carnet */}
                <div className="bg-white p-2 rounded-xl shadow-md shrink-0 flex flex-col items-center">
                  <QRCodeCanvas
                    id={`qr-card-${selectedForCard.code}`}
                    value={`${window.location.origin}/verificar/${selectedForCard.code}`}
                    size={72}
                    level="H"
                    includeMargin={false}
                  />
                  <span className="text-[7px] font-mono font-bold text-zinc-900 mt-1">
                    VERIFICAR
                  </span>
                </div>
              </div>

              {/* Pie del Carnet */}
              <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-zinc-400">
                <span>Credencial Oficial Eclesiástica</span>
                <span className="text-amber-400/80 font-semibold">Emitida en San Juan, Arg.</span>
              </div>
            </div>

            {/* URL y Acciones del QR */}
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    URL de Verificación Pública
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300 truncate block">
                    {`${window.location.origin}/verificar/${selectedForCard.code}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyVerificationLink(selectedForCard.code)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-zinc-700 hover:bg-brand-primary hover:text-white text-slate-700 dark:text-zinc-200 text-xs font-semibold transition-all cursor-pointer shrink-0"
                >
                  Copiar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => downloadQRCode(selectedForCard.code)}
                  className="py-3 px-4 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Descargar QR</span>
                </button>

                <a
                  href={`/verificar/${selectedForCard.code}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-4 rounded-xl bg-brand-primary text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-all text-center"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Probar Página</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCredentials;
