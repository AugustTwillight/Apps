interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({ value, max, color = 'bg-primary-500', height = 'h-2.5', showLabel = false, className = '' }: ProgressBarProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full ${height} bg-gray-200 rounded-full overflow-hidden`}>
        <div className={`${height} ${color} rounded-full transition-all duration-500 ease-out`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <p className="text-xs text-gray-500 mt-1">{pct}%</p>}
    </div>
  );
}
