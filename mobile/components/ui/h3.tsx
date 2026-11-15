import { ThemedText, type ThemedTextProps } from '../themed-text';

export function H3({ children, style, ...props }: ThemedTextProps) {
  return (
    <ThemedText type="h3" style={style} {...props}>
      {children}
    </ThemedText>
  );
}
