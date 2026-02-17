import React from 'react';

export const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-brand-silk dark:bg-brand-obsidian p-8 pt-24 pb-32">
            <div className="max-w-3xl mx-auto space-y-8 animate-reveal">
                <header className="text-center space-y-4">
                    <h1 className="text-4xl font-serif font-bold text-brand-obsidian dark:text-brand-primary">
                        Política de Privacidad
                    </h1>
                    <p className="text-sm opacity-60 uppercase tracking-widest font-black">
                        Monte de Sion App • Última actualización: {new Date().toLocaleDateString()}
                    </p>
                </header>

                <section className="bg-white dark:bg-brand-surface rounded-[2.5rem] p-10 shadow-xl border border-brand-obsidian/5 dark:border-white/5 prose dark:prose-invert max-w-none">
                    <h2 className="text-xl font-bold">1. Información que recopilamos</h2>
                    <p>
                        Para brindarte una experiencia personalizada, recopilamos los siguientes datos:
                    </p>
                    <ul>
                        <li><strong>Perfil:</strong> Nombre, dirección de correo electrónico, foto de perfil (si se proporciona) y región.</li>
                        <li><strong>Actividad:</strong> Interacciones en la comunidad, peticiones de oración, asistencia a eventos y puntos de impacto.</li>
                        <li><strong>Multimedia:</strong> Audio de peticiones de oración e imágenes compartidas.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8">2. Uso de la Información</h2>
                    <p>
                        Los datos se utilizan exclusivamente para:
                    </p>
                    <ul>
                        <li>Gestionar tu cuenta y participación en la comunidad.</li>
                        <li>Notificarte sobre eventos y nuevas publicaciones.</li>
                        <li>Calcular tu posición en el Ranking de Impacto.</li>
                        <li>Mejorar la funcionalidad de la aplicación.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8">3. Compartir Datos</h2>
                    <p>
                        Monte de Sion App no vende tus datos a terceros. Tu información solo es visible para otros miembros de la comunidad según la configuración de privacidad que elijas (peticiones públicas o privadas).
                    </p>

                    <h2 className="text-xl font-bold mt-8">4. Seguridad</h2>
                    <p>
                        Utilizamos Supabase para el almacenamiento seguro de datos, con encriptación y políticas de seguridad avanzadas para proteger tu información personal.
                    </p>

                    <h2 className="text-xl font-bold mt-8">5. Tus Derechos</h2>
                    <p>
                        Puedes solicitar el acceso, corrección o eliminación de tus datos personales en cualquier momento a través de la configuración de tu perfil o contactando a la administración de la iglesia.
                    </p>
                </section>
            </div>
        </div>
    );
};
