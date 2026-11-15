import { ThemedText, type ThemedTextProps } from '../themed-text';

export function Overline({ children, style, ...props }: ThemedTextProps) {
  return (
    <ThemedText type="overline" style={style} {...props}>
      {children}
    </ThemedText>
  );
}
