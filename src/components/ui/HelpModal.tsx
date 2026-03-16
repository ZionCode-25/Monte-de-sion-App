import React from 'react';
import { createPortal } from 'react-dom';

interface HelpItem {
  icon: string;
  title: string;
  description: string;
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: HelpItem[];
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, title, items }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-obsidian/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white dark:bg-brand-surface rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/20">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <span className="material-symbols-outlined">help_center</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-brand-obsidian dark:text-white">
              {title}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-gray-400 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-8 pb-10 space-y-6">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="flex gap-5 group animate-in slide-in-from-right duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-silk dark:bg-white/5 flex items-center justify-center text-brand-obsidian/40 dark:text-white/40 group-hover:bg-brand-primary group-hover:text-brand-obsidian transition-all shrink-0">
                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-sm font-black uppercase tracking-widest text-brand-obsidian dark:text-white mb-1 group-hover:text-brand-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-brand-silk/50 dark:bg-white/5 flex justify-end border-t border-gray-100 dark:border-white/5">
          <button
            onClick={onClose}
            className="bg-brand-obsidian dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default HelpModal;
