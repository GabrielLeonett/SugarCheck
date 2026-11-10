import { ThemedText, type ThemedTextProps } from '../themed-text';

export function Subtitle2({ children, style, ...props }: ThemedTextProps) {
  return (
    <ThemedText type="subtitle2" style={style} {...props}>
      {children}
    </ThemedText>
  );
}
