import { Button, type ButtonProps } from "@mui/material";

export function ButtonBase({ children, ...props }: ButtonProps) {
  return (
    <Button
      variant="contained" // Puedes dejar uno por defecto (contained, outlined o text)
      {...props}
      sx={{
        // 2. Estilos base por defecto para tus botones
        borderRadius: "8px",
        textTransform: "none", // Evita que el texto salga siempre en mayúsculas
        fontWeight: 500,
        padding: "8px 16px",
        fontSize: "0.875rem",
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