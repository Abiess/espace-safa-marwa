import { Badge } from './ui/badge';

interface ConfidenceChipProps {
  value: number;
  size?: 'sm' | 'default';
}

export function ConfidenceChip({ value, size = 'default' }: ConfidenceChipProps) {
  const variant = value >= 0.9 ? 'default' : value >= 0.75 ? 'secondary' : 'destructive';
  const text = `${(value * 100).toFixed(0)}%`;

  return (
    <Badge variant={variant} className={size === 'sm' ? 'text-xs' : ''}>
      {text}
    </Badge>
  );
}
