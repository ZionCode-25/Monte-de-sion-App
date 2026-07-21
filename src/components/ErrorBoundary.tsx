import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        const errorMsg = error.toString().toLowerCase();
        const isChunkError = 
            errorMsg.includes('unexpected token') || 
            errorMsg.includes('failed to fetch dynamically imported module') ||
            errorMsg.includes('chunkloaderror') ||
            errorMsg.includes('loading chunk');

        if (isChunkError && !sessionStorage.getItem('error_boundary_reloaded')) {
            sessionStorage.setItem('error_boundary_reloaded', 'true');
            window.location.reload();
        }
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg dark:bg-brand-obsidian p-6 text-center">
                    <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-6">
                        <span className="material-symbols-outlined text-5xl">error_outline</span>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-brand-obsidian dark:text-white mb-4">
                        Algo salió mal
                    </h1>
                    <p className="text-brand-obsidian/60 dark:text-white/60 mb-8 max-w-md">
                        Lo sentimos, ha ocurrido un error inesperado en la aplicación. Por favor, intenta recargar la página.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-3 bg-brand-primary text-brand-obsidian rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-brand-primary/90 transition-colors"
                        >
                            Recargar
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-8 py-3 bg-white dark:bg-brand-surface text-brand-obsidian dark:text-white border border-brand-obsidian/10 dark:border-white/10 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-silk dark:hover:bg-white/5 transition-colors"
                        >
                            Ir al Inicio
                        </button>
                    </div>
                    {this.state.error && (
                        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-left max-w-2xl overflow-auto w-full">
                            <p className="font-mono text-xs font-bold text-red-500 mb-1">Detalle del error:</p>
                            <p className="font-mono text-xs text-red-400 break-words">{this.state.error.toString()}</p>
                            {this.state.error.stack && (
                                <pre className="font-mono text-[10px] text-white/50 mt-2 overflow-x-auto whitespace-pre-wrap">
                                    {this.state.error.stack}
                                </pre>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
