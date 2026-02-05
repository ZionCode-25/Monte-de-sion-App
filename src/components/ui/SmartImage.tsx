
import React, { useState } from 'react';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
    containerClassName?: string;
}

export const SmartImage: React.FC<Props> = ({
    src,
    alt,
    className = '',
    containerClassName = '',
    ...props
}) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className={`relative overflow-hidden bg-brand-obsidian/5 dark:bg-white/5 ${containerClassName}`}>
            {/* Skeleton / Loading State */}
            {!loaded && !error && (
                <div className="absolute inset-0 animate-pulse bg-brand-obsidian/10 dark:bg-white/10 z-10" />
            )}

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-brand-obsidian/5 dark:bg-white/5 text-brand-obsidian/20 dark:text-white/20">
                    <span className="material-symbols-outlined text-4xl">broken_image</span>
                </div>
            )}

            {/* Helper Image to trigger onLoad */}
            <img
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
                className={`w-full h-full object-cover transition-opacity duration-700 ease-in-out ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
                {...props}
            />
        </div>
    );
};
