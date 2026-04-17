interface FastingToggleProps {
  isFasting: boolean;
  onChange: (isFasting: boolean) => void;
  disabled?: boolean;
}

export default function FastingToggle({ isFasting, onChange, disabled = false }: FastingToggleProps) {
  return (
    <label
      className="flex items-center gap-1 cursor-pointer select-none"
      title={isFasting ? 'Quitar ayuno' : 'Marcar como ayuno'}
      onClick={(e) => e.stopPropagation()} // no propagar al SlotCard click
    >
      <input
        type="checkbox"
        checked={isFasting}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-3 h-3 rounded accent-gray-500"
      />
      <span className={`text-xs font-medium ${isFasting ? 'text-gray-500' : 'text-gray-300'}`}>
        Ayuno
      </span>
    </label>
  );
}
