import { ThemedText, type ThemedTextProps } from '../themed-text';

export function H4({ children, style, ...props }: ThemedTextProps) {
  return (
    <ThemedText type="h4" style={style} {...props}>
      {children}
    </ThemedText>
  );
}
