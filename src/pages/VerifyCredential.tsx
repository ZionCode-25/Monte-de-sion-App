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
    if (!dateStr) return 'Indefinida / Sin fecha límite';
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

  return (
    <div className="min-h-screen bg-[#0d1117] text-stone-100 flex flex-col justify-between selection:bg-amber-600 selection:text-white font-sans antialiased">
      {/* Top Header Institucional */}
      <header className="border-b border-stone-800 bg-[#12161f]/90 sticky top-0 z-30 px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={LOGO_DARK_THEME}
              alt="Escudo Monte de Sion"
              className="w-9 h-9 object-contain transition-transform group-hover:scale-105"
            />
            <div>
              <span className="text-[10px] tracking-[0.25em] font-semibold text-amber-500 uppercase block leading-none">
                República Argentina
              </span>
              <h1 className="text-sm sm:text-base font-serif font-bold tracking-tight text-white mt-0.5">
                Iglesia Monte de Sion
              </h1>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right text-[10px] text-stone-400">
              <span className="font-mono text-stone-300">REGISTRO OFICIAL</span>
              <span>San Juan, Argentina</span>
            </div>
            <Link
              to="/"
              className="text-[11px] font-semibold tracking-wider uppercase px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-800/80 text-stone-300 hover:border-amber-500 hover:text-white transition-colors"
            >
              Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 md:py-10">
        {/* Buscador sobrio */}
        <form onSubmit={handleManualSearch} className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Número de Credencial (ej. PM-00125)"
              className="w-full px-4 py-2.5 bg-stone-900/90 border border-stone-800 rounded-xl text-xs sm:text-sm font-mono tracking-wider text-stone-200 placeholder:text-stone-500 focus:outline-hidden focus:border-amber-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl text-xs font-semibold tracking-wider uppercase text-stone-200 transition-colors cursor-pointer"
          >
            Consultar
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="bg-[#141824] rounded-2xl border border-stone-800 p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-stone-700 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-xs font-mono tracking-widest text-stone-400 uppercase">
              Consultando registro institucional central...
            </p>
          </div>
        )}

        {/* Documento Eclesiástico Verificado */}
        {!loading && credential && (
          <div className="bg-[#131722] border-2 border-[#262c3d] rounded-2xl shadow-2xl relative overflow-hidden">
            {/* Marco interior ornamental sutil */}
            <div className="absolute inset-2 border border-stone-800/80 rounded-xl pointer-events-none" />

            {/* Cabecera del Certificado */}
            <div className="p-6 sm:p-8 text-center border-b border-stone-800/90 relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-stone-900 border border-stone-700 mb-3 shadow-inner">
                <img src={LOGO_DARK_THEME} alt="Logo" className="w-9 h-9 object-contain" />
              </div>

              <p className="text-[10px] tracking-[0.3em] font-semibold text-amber-500 uppercase">
                Acreditación Eclesiástica Oficial
              </p>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight mt-1">
                Iglesia Cristiana Monte de Sion
              </h2>
              <p className="text-xs text-stone-400 font-serif italic mt-0.5">
                Personería Religiosa y Reconocimiento Ministerial • San Juan, República Argentina
              </p>

              {/* Dictamen de Estado */}
              <div className="mt-5 inline-flex flex-col items-center">
                {isValid && (
                  <div className="px-5 py-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-black tracking-[0.2em] uppercase">
                        Credencial Válida y Vigente
                      </span>
                    </div>
                  </div>
                )}

                {isExpired && (
                  <div className="px-5 py-2 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-xs font-black tracking-[0.2em] uppercase">
                        Credencial Vencida
                      </span>
                    </div>
                  </div>
                )}

                {isRevoked && (
                  <div className="px-5 py-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-400" />
                      <span className="text-xs font-black tracking-[0.2em] uppercase">
                        Credencial Revocada / No Activa
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ficha Oficial de Datos del Portador */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Sección Principal: Retrato y Nombre */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-stone-800/80 pb-6 text-center sm:text-left">
                {credential.photo_url ? (
                  <img
                    src={credential.photo_url}
                    alt={credential.full_name}
                    className="w-24 h-28 sm:w-28 sm:h-32 rounded-lg object-cover border-2 border-stone-700 bg-stone-900 shrink-0"
                  />
                ) : (
                  <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-lg bg-stone-900 border-2 border-stone-700 flex flex-col items-center justify-center shrink-0">
                    <span className="text-3xl font-serif font-bold text-amber-500">
                      {credential.full_name.charAt(0)}
                    </span>
                    <span className="text-[9px] text-stone-500 tracking-widest uppercase mt-1">
                      Oficial
                    </span>
                  </div>
                )}

                <div className="flex-1 space-y-1.5">
                  <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase block">
                    Titular Acreditado
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                    {credential.full_name}
                  </h3>
                  <p className="text-sm font-serif font-semibold text-amber-400">
                    {credential.role_title}
                  </p>
                  <p className="text-xs text-stone-400 font-mono pt-1">
                    Categoría: <span className="text-stone-300">{credential.category}</span>
                  </p>
                </div>
              </div>

              {/* Registro Tabular Estructurado */}
              <div className="divide-y divide-stone-800/70 border-y border-stone-800/80 text-xs sm:text-sm">
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-stone-400 font-serif">Matrícula / Código de Registro:</span>
                  <span className="font-mono font-bold text-stone-100 tracking-wider">
                    {credential.code}
                  </span>
                </div>

                {credential.document_number && (
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-stone-400 font-serif">Documento Nacional de Identidad (DNI):</span>
                    <span className="font-mono font-semibold text-stone-200">
                      {credential.document_number}
                    </span>
                  </div>
                )}

                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-stone-400 font-serif">Fecha de Emisión Original:</span>
                  <span className="text-stone-200 font-medium">
                    {formatDate(credential.issue_date)}
                  </span>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-stone-400 font-serif">Período de Validez Legal:</span>
                  <span className="text-stone-200 font-medium">
                    {credential.expiration_date ? formatDate(credential.expiration_date) : 'Indefinida'}
                  </span>
                </div>

                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-stone-400 font-serif">Jurisdicción y Sede:</span>
                  <span className="text-stone-200 font-medium">
                    {credential.location || 'San Juan, República Argentina'}
                  </span>
                </div>
              </div>

              {/* Observaciones */}
              {credential.notes && (
                <div className="p-3.5 rounded-lg bg-stone-900/60 border border-stone-800 text-xs text-stone-300">
                  <span className="text-[10px] font-mono tracking-wider text-amber-500 uppercase block mb-0.5">
                    Anotaciones del Registro:
                  </span>
                  <p className="font-serif italic">{credential.notes}</p>
                </div>
              )}

              {/* Dictamen y Cláusula de Validez Institucional */}
              <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 text-[11px] text-stone-400 leading-relaxed space-y-2">
                <div className="flex items-center gap-2 text-stone-300 font-semibold text-xs">
                  <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Certificación y Respaldo Institucional</span>
                </div>
                <p>
                  El presente registro certifica que el titular mencionado ha sido debidamente ordenado y acreditado por las autoridades eclesiásticas de la <strong>Iglesia Monte de Sion</strong> en la Provincia de San Juan, República Argentina, ejerciendo legalmente las funciones de su cargo ministerial.
                </p>
                <div className="pt-2 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-stone-500 font-mono">
                  <span>Consulta en tiempo real: {verifiedAt}</span>
                  <span>Registro Centralizado Supabase DB</span>
                </div>
              </div>

              {/* Botones de acción sobrios */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-center"
                >
                  {copied ? 'Enlace Oficial Copiado' : 'Compartir Verificación'}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2.5 px-5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer text-center"
                >
                  Imprimir Acta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sin resultados */}
        {!loading && hasSearched && !credential && (
          <div className="bg-[#131722] border border-stone-800 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto">
            <p className="text-xs font-mono tracking-widest text-amber-500 uppercase mb-2">
              Registro Eclesiástico
            </p>
            <h3 className="text-lg font-serif font-bold text-white mb-2">
              Credencial No Encontrada
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-6">
              El código <span className="font-mono font-bold text-stone-200">"{searchCode || routeCode}"</span> no corresponde a ninguna credencial activa o registrada en los archivos de la Iglesia Monte de Sion.
            </p>
            <Link
              to="/"
              className="inline-block px-5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-semibold tracking-wider uppercase text-stone-200 transition-colors"
            >
              Volver a la App
            </Link>
          </div>
        )}

        {/* Estado inicial */}
        {!loading && !hasSearched && (
          <div className="bg-[#131722] border border-stone-800 rounded-2xl p-8 text-center max-w-lg mx-auto">
            <p className="text-xs font-mono tracking-widest text-amber-500 uppercase mb-2">
              Portal Oficial de Verificación
            </p>
            <h3 className="text-lg font-serif font-bold text-white mb-2">
              Verificación de Credenciales
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Ingrese el número de credencial pastoral o ministerial impreso en el carnet para validar su autenticidad.
            </p>
          </div>
        )}
      </main>

      {/* Footer sobrio */}
      <footer className="py-4 px-4 text-center text-[11px] text-stone-500 border-t border-stone-900 bg-[#0d1117]">
        <p className="font-serif">
          Iglesia Monte de Sion • San Juan, República Argentina
        </p>
      </footer>
    </div>
  );
};

export default VerifyCredential;
