import { cn } from '@/lib/utils';

// ============================================
// BADGE COMPONENT
// ============================================

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// ============================================
// STATUS BADGE - For entry status
// ============================================

interface StatusBadgeProps {
  status: 'DONE' | 'NOT_DONE' | 'PARTIAL' | null;
  percentComplete?: number | null;
  className?: string;
}

export function StatusBadge({ status, percentComplete, className }: StatusBadgeProps) {
  if (!status) {
    return (
      <Badge variant="default" className={className}>
        No Entry
      </Badge>
    );
  }
  
  const variants: Record<string, 'success' | 'warning' | 'danger'> = {
    DONE: 'success',
    PARTIAL: 'warning',
    NOT_DONE: 'danger',
  };
  
  const labels: Record<string, string> = {
    DONE: 'Done',
    PARTIAL: percentComplete ? `${percentComplete}%` : 'Partial',
    NOT_DONE: 'Missed',
  };
  
  return (
    <Badge variant={variants[status]} className={className}>
      {labels[status]}
    </Badge>
  );
}

// ============================================
// FREQUENCY BADGE
// ============================================

interface FrequencyBadgeProps {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  className?: string;
}

export function FrequencyBadge({ frequency, className }: FrequencyBadgeProps) {
  const labels: Record<string, string> = {
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly',
    CUSTOM: 'Custom',
  };
  
  return (
    <Badge variant="info" className={className}>
      {labels[frequency]}
    </Badge>
  );
}
