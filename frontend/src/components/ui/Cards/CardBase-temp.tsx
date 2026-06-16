import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Typography
} from '@mui/material';
import type { ReactNode } from 'react';
import type { CardProps, SxProps, Theme } from '@mui/material';

export interface CustomCardProps extends Omit<CardProps, 'variant' | 'title' | 'subtitle'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  image?: string;
  imageHeight?: string | number;
  avatar?: ReactNode;
  headerAction?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  
  // Configuraciones de estilo express
  variant?: 'elevation' | 'outlined';
  elevation?: number;
  bgColor?: string;
  borderColor?: string;
  sx?: SxProps<Theme>;
}

export default function CustomCard({
  variant = 'elevation',
  elevation = 1,
  bgColor = 'background.paper',
  borderColor,
  title,
  subtitle,
  avatar,
  headerAction,
  image,
  imageHeight = '140',
  children,
  actions,
  sx = {},
  ...rest // Limpia el objeto: contiene solo props nativas de MUI (onClick, etc.)
}: CustomCardProps) {
  
  return (
    <Card
      variant={variant}
      elevation={variant === 'elevation' ? elevation : 0}
      sx={{
        maxWidth: 345,
        bgcolor: bgColor,
        borderRadius: 2,
        ...(variant === 'outlined' && borderColor && { borderColor: borderColor }),
        ...sx 
      }}
      {...rest} // Seguro de usar, ya no inyecta basura al HTML
    >
      {/* Renderiza el header solo si hay título, subtítulo o avatar */}
      {(title || subtitle || avatar || headerAction) && (
        <CardHeader
          avatar={avatar}
          action={headerAction}
          title={title}
          subheader={subtitle}
        />
      )}

      {/* Renderiza la imagen solo si se proporciona una URL */}
      {image && (
        <CardMedia
          component="img"
          height={imageHeight}
          image={image}
          alt={typeof title === 'string' ? title : "card image"}
        />
      )}

      {/* El contenido principal de la tarjeta */}
      {children && (
        <CardContent>
          {typeof children === 'string' ? (
            <Typography variant="body2" color="text.secondary">
              {children}
            </Typography>
          ) : (
            children 
          )}
        </CardContent>
      )}

      {/* Renderiza las acciones abajo si existen */}
      {actions && (
        <CardActions disableSpacing>
          {actions}
        </CardActions>
      )}
    </Card>
  );
}