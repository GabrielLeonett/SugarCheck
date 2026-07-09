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

export function CardBase({
  variant = 'elevation',
  elevation = 1,
  title,
  subtitle,
  image,
  imageHeight = '140',
  avatar,
  headerAction,
  actions,
  children,
  sx
}: CustomCardProps) {

  return (
    <Card
      variant={variant}
      elevation={variant === 'elevation' ? elevation : 0}
      sx={{ ...sx}}
    >
      {(title || subtitle || avatar || headerAction) && (
        <CardHeader
          avatar={avatar}
          action={headerAction}
          title={title}
          subheader={subtitle}
        />
      )}

      {image && (
        <CardMedia
          component="img"
          height={imageHeight}
          image={image}
          alt={typeof title === 'string' ? title : "card image"}
        />
      )}

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

      {actions && (
        <CardActions disableSpacing>
          {actions}
        </CardActions>
      )}
    </Card>
  );
}