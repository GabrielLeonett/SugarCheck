import { ThemedText, type ThemedTextProps } from '../themed-text';

export function H6({ children, style, ...props }: ThemedTextProps) {
  return (
    <ThemedText type="h6" style={style} {...props}>
      {children}
    </ThemedText>
  );
}
