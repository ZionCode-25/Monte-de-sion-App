import React from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    className?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({ className, ...props }) => {
    return (
        <img
            {...props}
            className={`${className} pointer-events-none select-none`}
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
        />
    );
};
