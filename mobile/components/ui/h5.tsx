import { ThemedText, type ThemedTextProps } from '../themed-text';

export function H5({ children, style, ...props }: ThemedTextProps) {
  return (
    <ThemedText type="h5" style={style} {...props}>
      {children}
    </ThemedText>
  );
}
