import { ThemedText, type ThemedTextProps } from '../themed-text';

export function Body2({ children, style, ...props }: ThemedTextProps) {
  return (
    <ThemedText type="body2" style={style} {...props}>
      {children}
    </ThemedText>
  );
}
