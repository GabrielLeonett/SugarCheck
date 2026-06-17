import { Button, type ButtonProps } from "@mui/material";

export function ButtonBase({ children, variant = 'contained', ...props }: ButtonProps) {
  return (
    <Button
      variant={variant}
      {...props}
      sx={{
        // 2. Estilos base por defecto para tus botones
        transition: "all 0.2s ease",

        // Si usas el botón 'contained', podemos heredar tus sombras dinámicas de hover
        "&.MuiButton-contained": {
          boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
          "&:hover": {
            boxShadow: "0px 4px 8px rgba(0,0,0,0.15)",
            transform: "translateY(-1px)", // El bonito efecto sutil de elevación que definiste en tu tema
          },
        },

        // Efecto hover sutil para la variante outlined
        "&.MuiButton-outlined": {
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },

        // 3. Mezclamos de forma segura los estilos que pases desde fuera
        ...(typeof props.sx === 'object' ? props.sx : {})
      }}
    >
      {children}
    </Button>
  );
}