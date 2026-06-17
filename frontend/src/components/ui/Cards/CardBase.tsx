import { Card, type CardProps } from "@mui/material";

export function CardBase({ children, ...props }: CardProps) {
    return (
        <Card
            {...props}
            sx={[
                (theme) => ({
                    bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'primary.200',
                    color: theme.palette.mode === 'dark' ? 'text.primary' : 'black',
                    borderRadius: "12px",
                    boxShadow: theme.palette.mode === 'dark'
                        ? "0 4px 12px rgba(0,0,0,0.5)"
                        : "0 4px 12px rgba(0,0,0,0.1)",
                    padding: 3,
                }),
                ...(Array.isArray(props.sx) ? props.sx : props.sx ? [props.sx] : [])
            ]}
        >
            {children}
        </Card>
    );
}