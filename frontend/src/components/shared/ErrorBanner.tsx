interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
    >
      <span className="text-red-500 shrink-0 mt-0.5">⚠</span>
      <p className="text-sm flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Cerrar error"
          className="text-red-400 hover:text-red-600 shrink-0"
        >
          ✕
        </button>
      )}
    </div>
  );
}
