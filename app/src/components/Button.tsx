import type { PressableProps, StyleProp, ViewStyle } from 'react-native';

import { Button as GSButton, ButtonText as GSButtonText } from '../../components/ui/button';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textClassName?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary rounded-full',
  // Brand purple — reserved for one primary CTA per screen, applied by the
  // screen itself, not a variant every screen reaches for by default.
  secondary: 'bg-brand-accent rounded-full',
  outline: 'bg-background border border-border rounded-full',
};

const TEXT_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-primary-foreground',
  secondary: 'text-brand-accent-foreground',
  outline: 'text-foreground',
};

/**
 * Fully-rounded button primitive per the design system (aagroup-web's
 * `rounded-full` convention). `variant="primary"` (near-black, the default
 * UI action color) should be used for most buttons; `variant="secondary"`
 * is the brand purple, reserved for exactly one primary CTA per screen.
 */
export function Button({ label, variant = 'primary', disabled, style, textClassName, ...rest }: ButtonProps) {
  return (
    <GSButton
      disabled={disabled}
      className={VARIANT_CLASSES[variant]}
      style={style}
      {...rest}
    >
      <GSButtonText className={`${TEXT_VARIANT_CLASSES[variant]} ${textClassName ?? ''}`}>{label}</GSButtonText>
    </GSButton>
  );
}
