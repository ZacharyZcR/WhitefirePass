import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Button component props
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

/**
 * Button component with multiple variants and sizes
 * @param props The button props
 * @param props.className Additional CSS classes
 * @param props.variant Button style variant
 * @param props.size Button size
 * @param props.children Button content
 * @param ref Forwarded ref
 * @returns Styled button element
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-sm font-serif tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      default: 'bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgba(255,240,210,0.35)] hover:bg-primary/90',
      outline:
        'border border-brass/35 bg-transparent text-parchment hover:border-brass/70 hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3 text-sm',
      lg: 'h-11 px-8',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
