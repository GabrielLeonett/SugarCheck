import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import {
  Phone as PhoneIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation("footer");
  const currentYear = new Date().getFullYear();

  return (
    <Box id="contact" sx={{ bgcolor: "primary.main", color: "white", py: 10 }}>
      <Container maxWidth="lg">
        {/* Título principal */}
        <Typography component="h2" variant="h3" sx={{ mb: 6, fontWeight: 600 }}>
          {t("title")}
        </Typography>

        <Grid container spacing={6}>
          {/* Columna izquierda - Información de contacto */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ mb: 4 }}>
              {t("subtitle")}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
              {t("description")}
            </Typography>

            {/* Botones de contacto */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Botón de email */}
              <Button
                variant="contained"
                size="large"
                startIcon={<EmailIcon />}
                href="mailto:gabrielleonett6688@gmail.com"
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  borderRadius: 2,
                  py: 1.5,
                  "&:hover": {
                    bgcolor: "#f0f0f0",
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease",
                  },
                }}
              >
                {t("sendEmail")}
              </Button>

              {/* Botón de teléfono */}
              <Button
                variant="outlined"
                size="large"
                startIcon={<PhoneIcon />}
                href="tel:+584142245310"
                sx={{
                  borderColor: "white",
                  color: "white",
                  borderRadius: 2,
                  py: 1.5,
                  "&:hover": {
                    borderColor: "#f0f0f0",
                    color: "#f0f0f0",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-2px)",
                    transition: "all 0.2s ease",
                  },
                }}
              >
                {t("callWhatsApp")}
              </Button>
            </Box>
          </Grid>

          {/* Columna derecha - Redes sociales y ubicación */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 4,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                height: "100%",
              }}
            >
              <Typography variant="h6" sx={{ mb: 3 }}>
                {t("connectSocial")}
              </Typography>

              {/* Botones de redes sociales */}
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {/* GitHub */}
                <Button
                  variant="contained"
                  startIcon={<GitHubIcon />}
                  href="https://github.com/GabrielLeonett"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    borderRadius: 2,
                    "&:hover": {
                      bgcolor: "#f0f0f0",
                      transform: "translateY(-2px)",
                      transition: "all 0.2s ease",
                    },
                  }}
                >
                  {t("github")}
                </Button>

                {/* LinkedIn */}
                <Button
                  variant="contained"
                  startIcon={<LinkedInIcon />}
                  href="https://www.linkedin.com/in/gabriel-leonett-1984b3293/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    bgcolor: "#0077b5",
                    color: "white",
                    borderRadius: 2,
                    "&:hover": {
                      bgcolor: "#0067a5",
                      transform: "translateY(-2px)",
                      transition: "all 0.2s ease",
                    },
                  }}
                >
                  {t("linkedin")}
                </Button>
              </Box>

              <Divider sx={{ my: 4, bgcolor: "rgba(255,255,255,0.2)" }} />

              {/* Ubicación */}
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.8,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <LocationOnIcon
                  sx={{
                    mr: 1,
                    fontSize: "1rem",
                    flexShrink: 0,
                  }}
                />
                {t("location")}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Typography
          variant="body2"
          sx={{
            mt: 8,
            textAlign: "center",
            opacity: 0.7,
            fontFamily: "monospace",
          }}
        >
          {t("copyright", { year: currentYear })}
        </Typography>
      </Container>
    </Box>
  );
}
