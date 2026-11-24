import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Link,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import CookieIcon from "@mui/icons-material/Cookie";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import i18n from "../../stores/i18n";
import {
  OPEN_COOKIE_PREFERENCES_EVENT,
  readCookieConsent,
  saveCookieConsent,
  type CookieConsentRecord,
} from "../../utils/cookieConsent";

export default function CookieConsent() {
  const { t } = useTranslation("legal");
  const navigate = useNavigate();

  const [consent, setConsent] = useState<CookieConsentRecord | null>(() => readCookieConsent());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preferencesAllowed, setPreferencesAllowed] = useState(
    () => readCookieConsent()?.preferences ?? true,
  );

  useEffect(() => {
    const handleOpenPreferences = () => {
      setPreferencesAllowed(readCookieConsent()?.preferences ?? true);
      setDialogOpen(true);
    };

    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences);
  }, []);

  const handleSave = (preferences: boolean) => {
    const record = saveCookieConsent(preferences);

    // Si se autorizan las preferencias, guardamos los valores activos en este momento.
    if (preferences) {
      window.localStorage.setItem(
        "theme",
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );
      window.localStorage.setItem("i18nextLng", i18n.language || "es");
    }

    setConsent(record);
    setDialogOpen(false);
  };

  const handleOpenDialog = () => {
    setPreferencesAllowed(consent?.preferences ?? true);
    setDialogOpen(true);
  };

  return (
    <>
      {consent === null && (
        <Paper
          component="section"
          role="region"
          aria-label={t("consent.title")}
          elevation={8}
          sx={{
            position: "fixed",
            bottom: { xs: 0, sm: 16 },
            left: { xs: 0, sm: 16 },
            right: { xs: 0, sm: 16 },
            mx: "auto",
            maxWidth: 960,
            p: { xs: 2, sm: 3 },
            borderRadius: { xs: 0, sm: 3 },
            border: 1,
            borderColor: "divider",
            zIndex: (theme) => theme.zIndex.snackbar + 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              alignItems: { md: "center" },
            }}
          >
            <CookieIcon color="primary" sx={{ fontSize: 32, flexShrink: 0 }} />

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" component="h2" gutterBottom>
                {t("consent.title")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("consent.message")}{" "}
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => navigate("/cookies")}
                  sx={{ verticalAlign: "baseline" }}
                >
                  {t("consent.policyLink")}
                </Link>
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ flexShrink: 0, width: { xs: "100%", sm: "auto" } }}
            >
              <Button variant="text" onClick={handleOpenDialog}>
                {t("consent.customize")}
              </Button>
              <Button variant="outlined" onClick={() => handleSave(false)}>
                {t("consent.necessaryOnly")}
              </Button>
              <Button variant="contained" onClick={() => handleSave(true)}>
                {t("consent.acceptAll")}
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("consent.preferencesTitle")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("consent.preferencesIntro")}
          </Typography>

          <Stack spacing={2}>
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle2">{t("consent.necessaryTitle")}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("consent.necessaryDesc")}
                </Typography>
              </Box>
              <Typography variant="caption" color="success.main" sx={{ whiteSpace: "nowrap" }}>
                {t("consent.alwaysActive")}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle2">{t("consent.preferencesCatTitle")}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("consent.preferencesCatDesc")}
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferencesAllowed}
                    onChange={(event) => setPreferencesAllowed(event.target.checked)}
                    slotProps={{ input: { "aria-label": t("consent.preferencesCatTitle") } }}
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="text" onClick={() => setDialogOpen(false)}>
            {t("consent.cancel")}
          </Button>
          <Button variant="contained" onClick={() => handleSave(preferencesAllowed)}>
            {t("consent.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
