import { ThemedText, type ThemedTextProps } from '../themed-text';

export function Subtitle({ children, style, ...props }: ThemedTextProps) {
  return (
    <ThemedText type="subtitle1" style={style} {...props}>
      {children}
    </ThemedText>
  );
}
