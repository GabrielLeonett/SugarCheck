import { ThemedText, type ThemedTextProps } from '../themed-text';

export function H2({ children, style, ...props }: ThemedTextProps) {
  return (
    <ThemedText type="h2" style={style} {...props}>
      {children}
    </ThemedText>
  );
}
