import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Credential } from '../types';
import { LOGO_DARK_THEME } from '../constants';

// Mapa de carnets oficiales y fotos de perfil
const OFFICIAL_CARD_IMAGES: Record<string, string> = {
  'PM-00125': '/credentials-cards/PM-00125.png',
  'PM-00126': '/credentials-cards/PM-00126.png',
  'PM-00127': '/credentials-cards/PM-00127.png',
  'PM-00128': '/credentials-cards/PM-00128.png',
};

const OFFICIAL_PHOTO_IMAGES: Record<string, string> = {
  'PM-00125': '/pastor-photos/PM-00125.jpeg',
  'PM-00126': '/pastor-photos/PM-00126.jpeg',
  'PM-00127': '/pastor-photos/PM-00127.jpeg',
  'PM-00128': '/pastor-photos/PM-00128.jpeg',
};


export const VerifyCredential: React.FC = () => {
  const { code: routeCode } = useParams<{ code?: string }>();
  const navigate = useNavigate();

  const [searchCode, setSearchCode] = useState(routeCode || '');
  const [credential, setCredential] = useState<Credential | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [verifiedAt] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

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
        title: `Acreditación Oficial - ${credential?.full_name || 'Monte de Sion'}`,
        text: `Verificación oficial de credencial pastoral - Iglesia Monte de Sion (San Juan, Argentina)`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Indefinida / Sin límite';
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

  const todayStr = new Date().toISOString().split('T')[0];
  const isRevoked = credential?.status === 'revoked';
  const isExpired = credential?.status === 'expired' || (Boolean(credential?.expiration_date) && credential!.expiration_date! < todayStr);
  const isValid = credential?.status === 'active' && !isExpired;

  const pastorPhoto = credential?.code ? OFFICIAL_PHOTO_IMAGES[credential.code] || credential.photo_url : credential?.photo_url;
  const cardImage = credential?.code ? OFFICIAL_CARD_IMAGES[credential.code] || credential.photo_url : null;

  return (
    <div className="min-h-screen bg-[#07090e] text-stone-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black font-sans antialiased">
      {/* Barra de navegación superior ultra sobria */}
      <header className="w-full border-b border-stone-800/60 bg-[#07090e]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3.5 group">
            <img
              src={LOGO_DARK_THEME}
              alt="Monte de Sion"
              className="w-9 h-9 object-contain opacity-95 group-hover:opacity-100 transition-opacity"
            />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono tracking-[0.3em] text-amber-500 uppercase font-semibold">
                Sede Central • San Juan
              </span>
              <span className="text-sm font-serif font-bold text-white tracking-wide">
                Iglesia Monte de Sion
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-stone-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>SISTEMA DE VERIFICACIÓN EN VIVO</span>
            </div>
            <Link
              to="/"
              className="text-[11px] font-mono tracking-wider uppercase px-3 py-1.5 rounded-md border border-stone-800 text-stone-300 hover:border-amber-500/60 hover:text-white transition-colors"
            >
              Portal App
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Buscador minimalista */}
        <form onSubmit={handleManualSearch} className="max-w-xl mx-auto mb-10">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-stone-900/90 border border-stone-800 focus-within:border-amber-500/60 transition-colors shadow-lg">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Número de Credencial (ej. PM-00125)"
              className="flex-1 px-4 py-2 bg-transparent text-xs sm:text-sm font-mono tracking-wider text-stone-100 placeholder:text-stone-600 focus:outline-hidden uppercase"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold tracking-wider uppercase font-mono transition-colors cursor-pointer"
            >
              Consultar
            </button>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border-2 border-stone-800 border-t-amber-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono tracking-[0.25em] text-stone-400 uppercase">
              Verificando autenticidad en registros oficiales...
            </p>
          </div>
        )}

        {/* Credencial Verificada (Sin cajas ni cards genéricas) */}
        {!loading && credential && (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* Banner de Estado Oficial y Solemne */}
            <div className="text-center space-y-3 flex flex-col items-center">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-stone-800 bg-stone-900/80">
                <span className={`w-2 h-2 rounded-full ${isValid ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : isExpired ? 'bg-amber-400' : 'bg-rose-400'}`} />
                <span className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-stone-200">
                  {isValid
                    ? 'Documento Oficial Verificado • Estado: Activo y Vigente'
                    : isExpired
                    ? 'Documento Oficial • Estado: Vencido'
                    : 'Documento Oficial • Estado: Revocado'}
                </span>
              </div>

              {/* Retrato oficial del pastor/a */}
              {pastorPhoto && (
                <div className="relative pt-2">
                  <div className="absolute inset-0 rounded-full bg-amber-500/15 blur-xl pointer-events-none" />
                  <img
                    src={pastorPhoto}
                    alt={credential.full_name}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-amber-500/70 shadow-2xl ring-4 ring-stone-900"
                  />
                </div>
              )}

              <div>
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                  {credential.full_name}
                </h2>
                <p className="text-sm sm:text-base font-serif text-amber-400 tracking-wide mt-1">
                  {credential.role_title} • Iglesia Monte de Sion
                </p>
              </div>
            </div>


            {/* Visualización Orgánica del Carnet Físico / Digital */}
            <div className="flex flex-col items-center justify-center relative">
              {/* Resplandor áurico ambiental */}
              <div className="absolute w-72 sm:w-96 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

              {cardImage ? (
                <div
                  onClick={() => setIsZoomed(true)}
                  className="relative group cursor-pointer max-w-xl w-full transition-transform duration-300 hover:scale-[1.02] active:scale-[0.99]"
                >
                  <img
                    src={cardImage}
                    alt={`Credencial de ${credential.full_name}`}
                    className="w-full h-auto rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-stone-700/60 object-cover"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-mono tracking-wider text-white uppercase backdrop-blur-[2px]">
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    <span>Click para ampliar credencial</span>
                  </div>
                </div>
              ) : (
                <div className="p-8 border border-stone-800 rounded-2xl text-center">
                  <p className="font-serif text-lg text-white">{credential.full_name}</p>
                  <p className="text-xs text-amber-400">{credential.role_title}</p>
                </div>
              )}
            </div>

            {/* Ficha Tipográfica Ministerial Directa (Sin cajas anidadas) */}
            <div className="max-w-2xl mx-auto pt-4 border-t border-stone-800/80">
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-baseline justify-between py-2 border-b border-stone-900">
                  <span className="font-serif text-stone-400">Titular de la Credencial:</span>
                  <span className="font-serif font-bold text-white tracking-wide text-right">
                    {credential.full_name}
                  </span>
                </div>

                <div className="flex items-baseline justify-between py-2 border-b border-stone-900">
                  <span className="font-serif text-stone-400">Jerarquía / Ministerio:</span>
                  <span className="font-serif font-semibold text-amber-400 text-right">
                    {credential.role_title}
                  </span>
                </div>

                {credential.document_number && (
                  <div className="flex items-baseline justify-between py-2 border-b border-stone-900">
                    <span className="font-serif text-stone-400">Documento Nacional de Identidad (DNI):</span>
                    <span className="font-mono font-semibold text-stone-200 text-right">
                      {credential.document_number}
                    </span>
                  </div>
                )}

                <div className="flex items-baseline justify-between py-2 border-b border-stone-900">
                  <span className="font-serif text-stone-400">Matrícula Eclesiástica Oficial:</span>
                  <span className="font-mono font-bold text-stone-100 tracking-wider text-right">
                    {credential.code}
                  </span>
                </div>

                <div className="flex items-baseline justify-between py-2 border-b border-stone-900">
                  <span className="font-serif text-stone-400">Período de Validez:</span>
                  <span className="font-mono text-stone-200 text-right">
                    {formatDate(credential.issue_date)} — {credential.expiration_date ? formatDate(credential.expiration_date) : 'Indefinida'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between py-2 border-b border-stone-900">
                  <span className="font-serif text-stone-400">Jurisdicción Pastoral:</span>
                  <span className="font-serif text-stone-200 text-right">
                    {credential.location || 'San Juan, República Argentina'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between py-2 border-b border-stone-900">
                  <span className="font-serif text-stone-400">Autoridad Institucional:</span>
                  <span className="font-serif italic text-stone-300 text-right">
                    Pastor Presidente Rafael Omar Flores
                  </span>
                </div>
              </div>

              {/* Declaración Solemne */}
              <div className="mt-8 pt-6 border-t border-stone-800/80 text-center space-y-3">
                <p className="font-serif italic text-xs sm:text-sm text-stone-400 max-w-xl mx-auto leading-relaxed">
                  “Damos crédito de que la persona que figura en esta acreditación es ministra ordenada de nuestra institución Cristiana bajo la firma del pastor presidente Rafael Omar Flores.”
                </p>
                <div className="text-[10px] font-mono text-stone-500 tracking-wider uppercase">
                  Verificación Digital Auténtica • Consulta: {verifiedAt}
                </div>
              </div>

              {/* Acciones de Verificación */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                {cardImage && (
                  <a
                    href={cardImage}
                    download={`Credencial_${credential.code}.png`}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider font-mono transition-colors text-center shadow-lg shadow-amber-500/10 cursor-pointer"
                  >
                    Descargar Credencial Original
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-200 font-semibold text-xs uppercase tracking-wider font-mono transition-colors cursor-pointer text-center"
                >
                  {copied ? '✓ Enlace Copiado' : 'Compartir Enlace'}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200 text-xs uppercase tracking-wider font-mono transition-colors cursor-pointer text-center"
                >
                  Imprimir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sin Resultados */}
        {!loading && hasSearched && !credential && (
          <div className="py-16 text-center max-w-md mx-auto space-y-4">
            <span className="text-xs font-mono tracking-[0.25em] text-rose-400 uppercase block">
              Registro No Encontrado
            </span>
            <h3 className="text-xl font-serif font-bold text-white">
              Código Inexistente
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              No se halló ningún registro ministerial con el código <strong className="font-mono text-stone-200">"{searchCode || routeCode}"</strong> en los archivos de la Iglesia Monte de Sion.
            </p>
            <Link
              to="/"
              className="inline-block mt-4 text-xs font-mono uppercase tracking-wider text-amber-500 hover:underline"
            >
              ← Volver al Portal
            </Link>
          </div>
        )}

        {/* Modal de Zoom para pantalla completa */}
        {isZoomed && cardImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
            onClick={() => setIsZoomed(false)}
          >
            <div className="relative max-w-4xl w-full">
              <button
                onClick={() => setIsZoomed(false)}
                className="absolute -top-10 right-0 text-stone-400 hover:text-white font-mono text-xs uppercase tracking-widest"
              >
                Cerrar ✕
              </button>
              <img
                src={cardImage}
                alt="Credencial Ampliada"
                className="w-full h-auto rounded-2xl shadow-2xl border border-stone-700"
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer Mínimo */}
      <footer className="py-6 px-4 text-center text-[10px] font-mono tracking-wider text-stone-600 border-t border-stone-900/60">
        <p>IGLESIA CRISTIANA MONTE DE SION • SAN JUAN, ARGENTINA</p>
      </footer>
    </div>
  );
};

export default VerifyCredential;
