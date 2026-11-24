import { Box, Button, Container, Divider, Paper, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import Navbar from "../../components/layout/Header/Navbar";
import Footer from "../../components/layout/Footer/Footer";
import type { LegalPageContent, LegalSectionContent } from "./types";

interface LegalLayoutProps {
  content: LegalPageContent;
  children: ReactNode;
}

export function LegalLayout({ content, children }: LegalLayoutProps) {
  const { t } = useTranslation("legal");
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: { xs: 4, md: 6 },
          px: { xs: 2, sm: 3 },
          bgcolor: "background.default",
        }}
      >
        <Container maxWidth="md" disableGutters>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/")}
            sx={{ mb: 2 }}
          >
            {t("back")}
          </Button>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              {content.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {content.updated}
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {content.intro}
            </Typography>
            {children}
          </Paper>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

interface LegalSectionsProps {
  sections: LegalSectionContent[];
}

export function LegalSections({ sections }: LegalSectionsProps) {
  return (
    <Stack spacing={3.5}>
      {sections.map((section, index) => (
        <Box component="section" key={`${section.title}-${index}`}>
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{ color: "primary.main" }}
          >
            {index + 1}. {section.title}
          </Typography>
          <Stack spacing={1.5}>
            {section.paragraphs.map((paragraph, paragraphIndex) => (
              <Typography
                key={`${section.title}-${paragraphIndex}`}
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.8 }}
              >
                {paragraph}
              </Typography>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
