import React from 'react';

export const TermsOfUse: React.FC = () => {
    return (
        <div className="min-h-screen bg-brand-silk dark:bg-brand-obsidian p-8 pt-24 pb-32">
            <div className="max-w-3xl mx-auto space-y-8 animate-reveal">
                <header className="text-center space-y-4">
                    <h1 className="text-4xl font-serif font-bold text-brand-obsidian dark:text-brand-primary">
                        Términos de Uso
                    </h1>
                    <p className="text-sm opacity-60 uppercase tracking-widest font-black">
                        Monte de Sion App • Última actualización: {new Date().toLocaleDateString()}
                    </p>
                </header>

                <section className="bg-white dark:bg-brand-surface rounded-[2.5rem] p-10 shadow-xl border border-brand-obsidian/5 dark:border-white/5 prose dark:prose-invert max-w-none">
                    <h2 className="text-xl font-bold">1. Aceptación de los Términos</h2>
                    <p>
                        Al registrarte en Monte de Sion App, aceptas cumplir con estos términos y condiciones, así como con todas las leyes y regulaciones locales aplicables.
                    </p>

                    <h2 className="text-xl font-bold mt-8">2. Normas de la Comunidad</h2>
                    <p>
                        Esta aplicación está diseñada para la edificación y fellowship de la comunidad cristiana. Se prohíbe terminantemente:
                    </p>
                    <ul>
                        <li>El uso de lenguaje ofensivo, discriminatorio o violento.</li>
                        <li>La publicación de contenido comercial no autorizado.</li>
                        <li>La suplantación de identidad de otros miembros o líderes.</li>
                        <li>Cualquier actividad que busque abusar del sistema de puntos (farming de puntos).</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8">3. Sistema de Impacto (Puntos)</h2>
                    <p>
                        El sistema de puntos es simbólico y busca fomentar la participación. La administración se reserva el derecho de ajustar el puntaje o remover puntos ante comportamientos abusivos.
                    </p>

                    <h2 className="text-xl font-bold mt-8">4. Propiedad del Contenido</h2>
                    <p>
                        Sigues siendo el propietario del contenido que publicas, pero otorgas a Monte de Sion App una licencia para mostrarlo dentro de la plataforma a otros miembros autorizados.
                    </p>

                    <h2 className="text-xl font-bold mt-8">5. Limitación de Responsabilidad</h2>
                    <p>
                        La aplicación se proporciona "tal cual". Si bien nos esforzamos por mantener la seguridad y disponibilidad, no garantizamos que el servicio sea ininterrumpido o libre de errores.
                    </p>
                </section>
            </div>
        </div>
    );
};
