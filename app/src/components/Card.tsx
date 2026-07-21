import type { ViewProps } from 'react-native';

import { Card as GSCard } from '../../components/ui/card';

interface CardProps extends ViewProps {
  padded?: boolean;
}

/** Neutral, bordered, rounded surface primitive for grouped content (cards, summaries, list rows). */
export function Card({ padded = true, className, ...rest }: CardProps & { className?: string }) {
  return (
    <GSCard
      className={`bg-background border border-border rounded-md shadow-none gap-0 ${padded ? 'p-lg' : 'p-0'} ${className ?? ''}`}
      {...rest}
    />
  );
}
