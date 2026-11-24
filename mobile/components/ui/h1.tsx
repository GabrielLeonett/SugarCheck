import { ThemedText, type ThemedTextProps } from '../themed-text';

export function H1({ children, style, ...props }: ThemedTextProps) {
  return (
    <ThemedText type="h1" style={style} {...props}>
      {children}
    </ThemedText>
  );
}
