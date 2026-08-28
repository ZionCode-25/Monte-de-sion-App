import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Credential } from '../types';
import { LOGO_LIGHT_THEME, LOGO_DARK_THEME } from '../constants';

export const VerifyCredential: React.FC = () => {
  const { code: routeCode } = useParams<{ code?: string }>();
  const navigate = useNavigate();

  const [searchCode, setSearchCode] = useState(routeCode || '');
  const [credential, setCredential] = useState<Credential | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchCredential = async (codeToSearch: string) => {
    const cleanCode = codeToSearch.trim();
    if (!cleanCode) {
      setCredential(null);
      setLoading(false);
      setHasSearched(true);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .ilike('code', cleanCode)
        .maybeSingle();

      if (error) {
        console.error('Error al verificar credencial:', error);
        setCredential(null);
      } else {
        setCredential(data as Credential | null);
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      setCredential(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeCode) {
      setSearchCode(routeCode);
      fetchCredential(routeCode);
    } else {
      setLoading(false);
    }
  }, [routeCode]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      navigate(`/verificar/${encodeURIComponent(searchCode.trim().toUpperCase())}`);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Credencial Oficial - ${credential?.full_name || 'Monte de Sion'}`,
        text: `Verificación oficial de credencial eclesiástica de la Iglesia Monte de Sion (San Juan, Argentina)`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Determinar estado de la credencial
  const getVerificationStatus = (cred: Credential) => {
    if (cred.status === 'revoked') {
      return {
        type: 'revoked',
        title: 'CREDENCIAL REVOCADA / ANULADA',
        subtitle: 'Esta credencial ha sido dada de baja por la administración.',
        colorBg: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
        badgeBg: 'bg-red-600 text-white',
        icon: (
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const isExpired = cred.status === 'expired' || (cred.expiration_date && cred.expiration_date < today);

    if (isExpired) {
      return {
        type: 'expired',
        title: 'CREDENCIAL VENCIDA',
        subtitle: 'El período de vigencia de esta credencial ha expirado.',
        colorBg: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
        badgeBg: 'bg-amber-500 text-white',
        icon: (
          <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      };
    }

    return {
      type: 'active',
      title: 'CREDENCIAL VÁLIDA Y VIGENTE',
      subtitle: 'Documento eclesiástico verificado y acreditado oficialmente.',
      colorBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
      badgeBg: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30',
      icon: (
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-1 rounded-full bg-emerald-500/20 animate-ping" />
          <svg className="w-10 h-10 text-emerald-600 dark:text-emerald-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      ),
    };
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Sin fecha límite';
    try {
      const [year, month, day] = dateStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const statusInfo = credential ? getVerificationStatus(credential) : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-brand-primary selection:text-white">
      {/* Header Institucional */}
      <header className="w-full bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shadow-xs py-4 px-4 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={LOGO_LIGHT_THEME}
              alt="Monte de Sion Logo"
              className="w-10 h-10 object-contain dark:hidden transition-transform group-hover:scale-105"
            />
            <img
              src={LOGO_DARK_THEME}
              alt="Monte de Sion Logo"
              className="w-10 h-10 object-contain hidden dark:block transition-transform group-hover:scale-105"
            />
            <div>
              <h1 className="text-sm font-bold tracking-wider uppercase text-brand-primary dark:text-brand-primary leading-tight">
                Iglesia Monte de Sion
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium tracking-tight">
                San Juan, Argentina • Sistema Oficial de Validación
              </p>
            </div>
          </Link>

          <Link
            to="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white transition-all flex items-center gap-1.5"
          >
            <span>Ir a la App</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 md:py-10">
        {/* Barra de búsqueda de credencial */}
        <div className="mb-6">
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Ej. PM-00125"
                className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-mono uppercase tracking-wider focus:outline-hidden focus:ring-2 focus:ring-brand-primary shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Verificar</span>
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 border border-slate-200 dark:border-zinc-800 shadow-xl text-center flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4" />
            <p className="text-base font-semibold text-slate-800 dark:text-zinc-200">Consultando registros oficiales...</p>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">Conectando con la base de datos de Monte de Sion</p>
          </div>
        )}

        {/* Credencial Encontrada */}
        {!loading && credential && statusInfo && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-2xl transition-all duration-300">
            {/* Banner de Estado */}
            <div className={`p-6 sm:p-8 border-b ${statusInfo.colorBg} flex flex-col items-center text-center relative overflow-hidden`}>
              <div className="mb-3">{statusInfo.icon}</div>
              <div className={`inline-block px-3.5 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-1.5 ${statusInfo.badgeBg}`}>
                {statusInfo.title}
              </div>
              <p className="text-xs max-w-md font-medium opacity-90">{statusInfo.subtitle}</p>
            </div>

            {/* Ficha de Identificación Pastoral / Ministerial */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Encabezado del Titular */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left border-b border-slate-100 dark:border-zinc-800/80 pb-6">
                {credential.photo_url ? (
                  <img
                    src={credential.photo_url}
                    alt={credential.full_name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-brand-primary/40 shadow-md ring-4 ring-slate-100 dark:ring-zinc-800"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-brand-primary to-amber-500 flex items-center justify-center text-white text-3xl font-black shadow-md ring-4 ring-slate-100 dark:ring-zinc-800">
                    {credential.full_name.charAt(0)}
                  </div>
                )}

                <div className="flex-1 space-y-1">
                  <div className="inline-block px-2.5 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary text-[11px] font-bold tracking-wide uppercase mb-1">
                    {credential.category || 'PASTORAL'}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {credential.full_name}
                  </h2>
                  <p className="text-base sm:text-lg font-semibold text-brand-primary">
                    {credential.role_title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-center sm:justify-start gap-1 pt-1">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{credential.location || 'San Juan, Argentina'}</span>
                  </p>
                </div>
              </div>

              {/* Grid de Datos Técnicos de la Credencial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                    Nº de Credencial Oficial
                  </span>
                  <p className="text-lg font-mono font-bold text-slate-900 dark:text-white tracking-wider">
                    {credential.code}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                    Emisión y Registro
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatDate(credential.issue_date)}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                    Vigencia hasta
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {credential.expiration_date ? formatDate(credential.expiration_date) : 'Indefinida'}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                    Institución Emisora
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Iglesia Monte de Sion
                  </p>
                </div>

                {credential.document_number && (
                  <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 sm:col-span-2">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                      Documento Nacional de Identidad (DNI)
                    </span>
                    <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                      {credential.document_number}
                    </p>
                  </div>
                )}
              </div>


              {credential.notes && (
                <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/15 text-xs text-slate-600 dark:text-zinc-300">
                  <p className="font-semibold text-brand-primary mb-0.5">Observaciones institucionales:</p>
                  <p>{credential.notes}</p>
                </div>
              )}

              {/* Sello de Garantía y Validez Institucional */}
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-3.5 text-slate-500 dark:text-zinc-400">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-[11px] leading-relaxed">
                  <p className="font-semibold text-slate-700 dark:text-zinc-200">
                    Certificación de Autenticidad Digital
                  </p>
                  <p>
                    Esta credencial fue emitida y verificada por la <strong>Iglesia Monte de Sion – San Juan, Argentina</strong>. Cualquier adulteración física invalida su legitimidad.
                  </p>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>{copied ? '¡Enlace copiado!' : 'Compartir Verificación'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-3 px-5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Imprimir Comprobante</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sin Resultados / Código No Encontrado */}
        {!loading && hasSearched && !credential && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-zinc-800 shadow-xl text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Credencial No Encontrada
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mb-6 leading-relaxed">
              No se encontró ninguna credencial registrada con el código <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">"{searchCode || routeCode}"</span>. Verificá que el código esté escrito correctamente o comunicate con la secretaría de la Iglesia.
            </p>
            <Link
              to="/"
              className="px-6 py-2.5 rounded-xl bg-brand-primary text-white font-semibold text-xs tracking-wide uppercase hover:opacity-90 transition-all"
            >
              Volver al Inicio
            </Link>
          </div>
        )}

        {/* Initial Empty State (si entró a /verificar sin código) */}
        {!loading && !hasSearched && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-zinc-800 shadow-xl text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Portal de Verificación de Credenciales
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mb-4 leading-relaxed">
              Ingresá el número o código oficial impreso en el carnet pastoral o ministerial (por ejemplo: <strong className="text-slate-800 dark:text-zinc-200">PM-00125</strong>) para comprobar su validez oficial.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-xs text-slate-400 dark:text-zinc-500 border-t border-slate-200 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50">
        <p className="font-medium">
          © {new Date().getFullYear()} Iglesia Monte de Sion • San Juan, Argentina
        </p>
        <p className="text-[11px] mt-0.5 text-slate-400 dark:text-zinc-600">
          Documento digital con validez institucional interna e interministerial.
        </p>
      </footer>
    </div>
  );
};

export default VerifyCredential;
