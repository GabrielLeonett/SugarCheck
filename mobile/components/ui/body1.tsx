import { ThemedText, type ThemedTextProps } from '../themed-text';

export function Body1({ children, style, ...props }: ThemedTextProps) {
  return (
    <ThemedText type="body1" style={style} {...props}>
      {children}
    </ThemedText>
  );
}
