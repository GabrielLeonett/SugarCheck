import { ThemedText, type ThemedTextProps } from '../themed-text';

export function Caption({ children, style, ...props }: ThemedTextProps) {
  return (
    <ThemedText type="caption" style={style} {...props}>
      {children}
    </ThemedText>
  );
}
