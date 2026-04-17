import { useEffect, useRef, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

const ANIM_MS = 180;

export default function Modal({ isOpen, title, onClose, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // rendered: mantiene el DOM vivo durante la animación de salida
  const [rendered, setRendered] = useState(isOpen);
  // visible: controla las clases CSS de transición
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      // Doble rAF para garantizar que el elemento está en el DOM antes de aplicar la clase
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setRendered(false), ANIM_MS);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!rendered) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{ transitionDuration: `${ANIM_MS}ms` }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50
        transition-opacity ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        style={{ transitionDuration: `${ANIM_MS}ms` }}
        className={`bg-white rounded-xl shadow-xl w-full ${SIZE_CLASSES[size]} max-h-[90vh] flex flex-col
          transition-all ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>
        {/* Contenido con scroll interno */}
        <div className="overflow-y-auto p-6 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
