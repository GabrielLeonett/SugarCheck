import { Card, type CardProps } from "@mui/material";

export function CardBase({ children, ...props }: CardProps) {
    return (
        <Card
            {...props}
            sx={{
                bgcolor: 'primary.200',
                color: 'black',
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: 3,
                ...(typeof props.sx === 'object' ? props.sx : {})
            }}
        >
            {children}
        </Card>
    );
}