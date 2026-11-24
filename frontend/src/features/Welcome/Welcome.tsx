import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import LoginIcon from "@mui/icons-material/Login";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ShieldIcon from "@mui/icons-material/Shield";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import Footer from "../../components/layout/Footer/Footer";
import { ButtonBase } from "../../components/ui/Buttons/ButtonBase";
import { ConfigRow } from "../../components/ui/ConfigRow";
import useLanguage from "../../hooks/useLanguage";
import logo from "../../assets/icons/SugarCheck.svg";
import mascot from "../../assets/gluco-saludo.png";
import shield from "../../assets/escudo-transparente.png";
import dashboard from "../../assets/dashboard.png";
import lanzas from "../../assets/insigniasCamino/lanzas.png";
import escudoFibra from "../../assets/insigniasCamino/escudo_de_fribra.png";
import yelmo from "../../assets/insigniasCamino/yelmo_de_sabiduria.png";

const SECTION_SCROLL_MARGIN = { scrollMarginTop: { xs: 84, md: 96 } };

export default function Welcome() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useLanguage("welcome");

  const navLinks = [
    { label: t("nav.benefits"), href: "#beneficios" },
    { label: t("nav.how"), href: "#como-funciona" },
    { label: t("nav.path"), href: "#camino" },
    { label: t("nav.faq"), href: "#faq" },
  ];

  const features = [
    {
      icon: <WaterDropIcon />,
      title: t("features.glucose.title"),
      description: t("features.glucose.description"),
    },
    {
      icon: <VaccinesIcon />,
      title: t("features.insulin.title"),
      description: t("features.insulin.description"),
    },
    {
      icon: <MonitorHeartIcon />,
      title: t("features.physical.title"),
      description: t("features.physical.description"),
    },
    {
      icon: <SmartToyIcon />,
      title: t("features.oracle.title"),
      description: t("features.oracle.description"),
    },
    {
      icon: <EmojiEventsIcon />,
      title: t("features.path.title"),
      description: t("features.path.description"),
    },
    {
      icon: <FamilyRestroomIcon />,
      title: t("features.guardians.title"),
      description: t("features.guardians.description"),
    },
  ];

  const levels = [
    {
      image: lanzas,
      name: t("path.apprentice.name"),
      description: t("path.apprentice.description"),
      xp: t("path.apprentice.xp"),
    },
    {
      image: escudoFibra,
      name: t("path.guardian.name"),
      description: t("path.guardian.description"),
      xp: t("path.guardian.xp"),
    },
    {
      image: yelmo,
      name: t("path.legend.name"),
      description: t("path.legend.description"),
      xp: t("path.legend.xp"),
    },
  ];

  const steps = [
    {
      title: t("how.step1.title"),
      description: t("how.step1.description"),
    },
    {
      title: t("how.step2.title"),
      description: t("how.step2.description"),
    },
    {
      title: t("how.step3.title"),
      description: t("how.step3.description"),
    },
  ];

  const guardianPoints = [
    t("guardians.point1"),
    t("guardians.point2"),
    t("guardians.point3"),
    t("guardians.point4"),
  ];

  const faqs = [1, 2, 3, 4].map((number) => ({
    question: t(`faq.q${number}`),
    answer: t(`faq.a${number}`),
  }));

  const accentColor =
    theme.palette.mode === "light"
      ? theme.palette.primary.dark
      : theme.palette.primary.main;
  const accentContrast =
    theme.palette.mode === "light" ? "#ffffff" : theme.palette.primary.contrastText;
  const accentHover =
    theme.palette.mode === "light" ? "#2f4a5e" : theme.palette.primary.light;
  const primaryButtonSx = {
    bgcolor: accentColor,
    color: accentContrast,
    "&:hover": { bgcolor: accentHover },
  };

  const heroBackground =
    theme.palette.mode === "light"
      ? "radial-gradient(circle at 80% 16%, rgba(149,191,223,0.55) 0%, rgba(228,239,247,0) 42%), radial-gradient(circle at 6% 88%, rgba(88,102,173,0.16) 0%, rgba(228,239,247,0) 38%)"
      : "radial-gradient(circle at 80% 16%, rgba(88,102,173,0.42) 0%, rgba(18,18,18,0) 42%), radial-gradient(circle at 6% 88%, rgba(149,191,223,0.14) 0%, rgba(18,18,18,0) 38%)";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Encabezado */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: theme.zIndex.appBar,
          bgcolor:
            theme.palette.mode === "light"
              ? "rgba(228,239,247,0.88)"
              : "rgba(18,18,18,0.88)",
          backdropFilter: "blur(10px)",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            spacing={2}
            sx={{
              minHeight: { xs: 68, md: 80 },
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack
              component="a"
              href="/"
              direction="row"
              spacing={1.5}
              onClick={(event) => {
                event.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              sx={{
                cursor: "pointer",
                alignItems: "center",
                textDecoration: "none",
              }}
              aria-label={t("brand.homeLabel")}
            >
              <Box
                component="img"
                src={logo}
                alt={t("brand.logoAlt")}
                sx={{ width: { xs: 36, md: 44 }, height: "auto" }}
              />
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography
                  variant="h6"
                  color="text.primary"
                  sx={{ fontWeight: 700, lineHeight: 1.1 }}
                >
                  SugarCheck
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("brand.tagline")}
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={3}
              sx={{ display: { xs: "none", lg: "flex" } }}
              component="nav"
              aria-label="Secciones de la página"
            >
              {navLinks.map((link) => (
                <Typography
                  key={link.href}
                  component="a"
                  href={link.href}
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    textDecoration: "none",
                    fontWeight: 600,
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  display: { xs: "none", md: "block" },
                  "& > .MuiStack-root": { width: "auto" },
                }}
              >
                <ConfigRow />
              </Box>
              <IconButton
                component="a"
                href="/login"
                aria-label={t("nav.login")}
                onClick={(event) => {
                  event.preventDefault();
                  navigate("/login");
                }}
                sx={{
                  display: { xs: "inline-flex", sm: "none" },
                  color: "text.primary",
                }}
              >
                <LoginIcon />
              </IconButton>
              <Button
                variant="text"
                size="small"
                startIcon={<LoginIcon />}
                href="/login"
                onClick={(event) => {
                  event.preventDefault();
                  navigate("/login");
                }}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  color: accentColor,
                }}
              >
                {t("nav.login")}
              </Button>
              <ButtonBase
                variant="contained"
                size="small"
                startIcon={<PersonAddIcon />}
                href="/register"
                onClick={(event) => {
                  event.preventDefault();
                  navigate("/register");
                }}
                sx={{ px: 2, whiteSpace: "nowrap", ...primaryButtonSx }}
              >
                {t("nav.register")}
              </ButtonBase>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box component="main">
        {/* Hero */}
        <Box
          component="section"
          sx={{
            position: "relative",
            overflow: "hidden",
            background: heroBackground,
            py: { xs: 6, sm: 8, md: 11 },
          }}
          aria-labelledby="welcome-title"
        >
          <Container maxWidth="lg">
            <Grid
              container
              spacing={{ xs: 5, md: 7 }}
              sx={{ alignItems: "center" }}
            >
              <Grid size={{ xs: 12, md: 6 }}>
                <Chip
                  icon={<ShieldIcon />}
                  label={t("hero.badge")}
                  variant="outlined"
                  sx={{
                    bgcolor: "background.paper",
                    borderColor: "primary.main",
                    color: "text.primary",
                    fontWeight: 600,
                  }}
                />
                <Typography
                  id="welcome-title"
                  component="h1"
                  variant="h2"
                  sx={{
                    mt: 3,
                    fontWeight: 800,
                    lineHeight: 1.08,
                    fontSize: { xs: "2.35rem", sm: "3rem", md: "3.65rem" },
                    letterSpacing: { xs: 0, md: "-0.5px" },
                  }}
                >
                  {t("hero.title")}{" "}
                  <Box
                    component="span"
                    sx={{ color: accentColor, display: "inline" }}
                  >
                    {t("hero.titleAccent")}
                  </Box>
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    mt: 2.5,
                    maxWidth: 520,
                    fontSize: { xs: "1rem", md: "1.1rem" },
                  }}
                >
                  {t("hero.description")}
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ mt: 4 }}
                >
                  <ButtonBase
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    href="/register"
                    onClick={(event) => {
                      event.preventDefault();
                      navigate("/register");
                    }}
                    sx={{ px: 3, ...primaryButtonSx }}
                  >
                    {t("hero.primaryCta")}
                  </ButtonBase>
                  <Button
                    variant="outlined"
                    size="large"
                    href="/login"
                    onClick={(event) => {
                      event.preventDefault();
                      navigate("/login");
                    }}
                    sx={{
                      px: 3,
                      bgcolor: "background.paper",
                      color: accentColor,
                      borderColor: "primary.main",
                    }}
                  >
                    {t("hero.secondaryCta")}
                  </Button>
                </Stack>

                <Stack
                  component="ul"
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 1, sm: 2 }}
                  sx={{
                    mt: 4,
                    pl: 0,
                    listStyle: "none",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  {[t("hero.trust1"), t("hero.trust2"), t("hero.trust3")].map(
                    (item) => (
                      <Stack
                        component="li"
                        key={item}
                        direction="row"
                        spacing={0.75}
                        sx={{ alignItems: "center" }}
                      >
                        <CheckCircleIcon
                          sx={{ fontSize: 18, color: "success.main" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {item}
                        </Typography>
                      </Stack>
                    ),
                  )}
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    minHeight: { xs: 360, sm: 430, md: 470 },
                  }}
                >
                  <Box
                    aria-hidden="true"
                    sx={{
                      position: "absolute",
                      width: { xs: 280, sm: 360, md: 400 },
                      height: { xs: 280, sm: 360, md: 400 },
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      opacity: 0.16,
                      top: "12%",
                    }}
                  />
                  <Box
                    component="img"
                    src={mascot}
                    alt={t("hero.mascotAlt")}
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      width: { xs: 220, sm: 280, md: 330 },
                      height: "auto",
                      filter: "drop-shadow(0 22px 26px rgba(0,0,0,0.18))",
                    }}
                  />
                  <Box
                    component="img"
                    src={shield}
                    alt=""
                    aria-hidden="true"
                    sx={{
                      position: "absolute",
                      right: { xs: "3%", sm: "8%", md: "10%" },
                      top: { xs: "6%", md: "4%" },
                      width: { xs: 72, sm: 95, md: 118 },
                      height: "auto",
                      zIndex: 2,
                      filter: "drop-shadow(0 12px 16px rgba(0,0,0,0.22))",
                      transform: "rotate(4deg)",
                    }}
                  />
                  <Paper
                    elevation={4}
                    sx={{
                      position: "absolute",
                      left: { xs: 0, sm: 10, md: 0 },
                      top: { xs: "22%", md: "24%" },
                      zIndex: 3,
                      px: 2,
                      py: 1.5,
                      borderRadius: 3,
                      minWidth: 128,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "primary.main",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      {t("hero.visual.safeZone")}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, lineHeight: 1.15 }}
                    >
                      {t("hero.visual.safeZoneValue")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("hero.visual.safeZoneCaption")}
                    </Typography>
                  </Paper>
                  <Paper
                    elevation={4}
                    sx={{
                      position: "absolute",
                      right: { xs: 0, sm: 20, md: 10 },
                      bottom: { xs: "12%", md: "16%" },
                      zIndex: 3,
                      px: 2,
                      py: 1.5,
                      borderRadius: 3,
                      minWidth: 128,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#b7791f",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      {t("hero.visual.experience")}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, lineHeight: 1.15 }}
                    >
                      {t("hero.visual.experienceValue")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("hero.visual.experienceCaption")}
                    </Typography>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Beneficios */}
        <Box
          component="section"
          id="beneficios"
          sx={{ py: { xs: 7, md: 10 }, ...SECTION_SCROLL_MARGIN }}
          aria-labelledby="benefits-title"
        >
          <Container maxWidth="lg">
            <Stack
              spacing={1.5}
              sx={{ alignItems: "center", textAlign: "center", mb: 6 }}
            >
              <Typography
                variant="overline"
                sx={{ fontWeight: 700, color: accentColor }}
              >
                {t("features.eyebrow")}
              </Typography>
              <Typography
                id="benefits-title"
                component="h2"
                variant="h3"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.85rem", md: "2.5rem" },
                  maxWidth: 720,
                }}
              >
                {t("features.title")}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 640 }}
              >
                {t("features.subtitle")}
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              {features.map((feature) => (
                <Grid key={feature.title} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "background.paper",
                      borderColor: "divider",
                      boxShadow: "none",
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: "0 12px 28px rgba(61,88,108,0.12)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: 2.5,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: accentColor,
                        color: accentContrast,
                        mb: 2.5,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      component="h3"
                      variant="h6"
                      sx={{ fontWeight: 700, mb: 1 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Camino del Guerrero */}
        <Box
          component="section"
          id="camino"
          sx={{
            py: { xs: 7, md: 10 },
            background: "linear-gradient(135deg, #2f4a5e 0%, #3d586c 45%, #5866ad 100%)",
            color: "common.white",
            ...SECTION_SCROLL_MARGIN,
          }}
          aria-labelledby="path-title"
        >
          <Container maxWidth="lg">
            <Stack
              spacing={1.5}
              sx={{ alignItems: "center", textAlign: "center", mb: 6 }}
            >
              <Typography
                variant="overline"
                sx={{ color: "#f2c14e", fontWeight: 700 }}
              >
                {t("path.eyebrow")}
              </Typography>
              <Typography
                id="path-title"
                component="h2"
                variant="h3"
                sx={{ fontWeight: 700, fontSize: { xs: "1.85rem", md: "2.5rem" } }}
              >
                {t("path.title")}
              </Typography>
              <Typography
                variant="body1"
                sx={{ maxWidth: 620, color: "rgba(255,255,255,0.76)" }}
              >
                {t("path.subtitle")}
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              {levels.map((level, index) => (
                <Grid key={level.name} size={{ xs: 12, md: 4 }}>
                  <Box
                    sx={{
                      height: "100%",
                      p: 3.5,
                      borderRadius: 3,
                      bgcolor: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.16)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      transition: "transform 0.2s ease, background-color 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        bgcolor: "rgba(255,255,255,0.12)",
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={level.image}
                      alt=""
                      aria-hidden="true"
                      sx={{
                        width: 104,
                        height: 104,
                        objectFit: "contain",
                        mb: 2,
                        filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.3))",
                      }}
                    />
                    <Typography
                      variant="overline"
                      sx={{ color: "#f2c14e", fontWeight: 700 }}
                    >
                      {t("path.level", { number: index + 1 })}
                    </Typography>
                    <Typography
                      component="h3"
                      variant="h5"
                      sx={{ fontWeight: 700, mt: 0.5 }}
                    >
                      {level.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.78)",
                        mt: 1,
                        flexGrow: 1,
                      }}
                    >
                      {level.description}
                    </Typography>
                    <Chip
                      label={level.xp}
                      size="small"
                      sx={{
                        mt: 2.5,
                        bgcolor: "rgba(242,193,78,0.16)",
                        color: "#f2c14e",
                        border: "1px solid rgba(242,193,78,0.4)",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Stack sx={{ alignItems: "center", mt: 5 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                href="/register"
                onClick={(event) => {
                  event.preventDefault();
                  navigate("/register");
                }}
                sx={{
                  bgcolor: "common.white",
                  color: "primary.dark",
                  px: 3,
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                {t("path.cta")}
              </Button>
            </Stack>
          </Container>
        </Box>

        {/* Vista previa del panel */}
        <Box
          component="section"
          id="cuartel"
          sx={{ py: { xs: 7, md: 10 }, ...SECTION_SCROLL_MARGIN }}
          aria-labelledby="preview-title"
        >
          <Container maxWidth="lg">
            <Grid
              container
              spacing={{ xs: 4, md: 6 }}
              sx={{ alignItems: "center" }}
            >
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography
                  variant="overline"
                  sx={{ fontWeight: 700, color: accentColor }}
                >
                  {t("preview.eyebrow")}
                </Typography>
                <Typography
                  id="preview-title"
                  component="h2"
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    mt: 1,
                    fontSize: { xs: "1.85rem", md: "2.4rem" },
                  }}
                >
                  {t("preview.title")}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 2, mb: 3 }}
                >
                  {t("preview.description")}
                </Typography>
                <Button
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  href="/register"
                  onClick={(event) => {
                    event.preventDefault();
                    navigate("/register");
                  }}
                  sx={{ color: accentColor, borderColor: "primary.main" }}
                >
                  {t("preview.cta")}
                </Button>
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Card
                  elevation={8}
                  sx={{
                    p: { xs: 1, sm: 1.5 },
                    borderRadius: 3,
                    bgcolor: "background.paper",
                    overflow: "hidden",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ px: 1, py: 1 }}
                    aria-hidden="true"
                  >
                    {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
                      <Box
                        key={color}
                        sx={{
                          width: 11,
                          height: 11,
                          borderRadius: "50%",
                          bgcolor: color,
                        }}
                      />
                    ))}
                  </Stack>
                  <Box
                    component="img"
                    src={dashboard}
                    alt={t("preview.caption")}
                    sx={{
                      display: "block",
                      width: "100%",
                      height: "auto",
                      borderRadius: 2,
                    }}
                  />
                </Card>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", textAlign: "center", mt: 1.5 }}
                >
                  {t("preview.caption")}
                </Typography>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Cómo funciona */}
        <Box
          component="section"
          id="como-funciona"
          sx={{
            py: { xs: 7, md: 10 },
            bgcolor: "background.paper",
            ...SECTION_SCROLL_MARGIN,
          }}
          aria-labelledby="how-title"
        >
          <Container maxWidth="lg">
            <Stack
              spacing={1.5}
              sx={{ alignItems: "center", textAlign: "center", mb: 6 }}
            >
              <Typography
                variant="overline"
                sx={{ fontWeight: 700, color: accentColor }}
              >
                {t("how.eyebrow")}
              </Typography>
              <Typography
                id="how-title"
                component="h2"
                variant="h3"
                sx={{ fontWeight: 700, fontSize: { xs: "1.85rem", md: "2.5rem" } }}
              >
                {t("how.title")}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 600 }}
              >
                {t("how.subtitle")}
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              {steps.map((step, index) => (
                <Grid key={step.title} size={{ xs: 12, md: 4 }}>
                  <Stack
                    spacing={2}
                    sx={{ alignItems: "center", textAlign: "center", px: 2 }}
                  >
                    <Avatar
                      sx={{
                        width: 58,
                        height: 58,
                        bgcolor: accentColor,
                        color: accentContrast,
                        fontWeight: 700,
                        fontSize: 22,
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Typography
                      component="h3"
                      variant="h6"
                      sx={{ fontWeight: 700 }}
                    >
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Para los guardianes */}
        <Box
          component="section"
          id="guardianes"
          sx={{ py: { xs: 7, md: 10 }, ...SECTION_SCROLL_MARGIN }}
          aria-labelledby="guardians-title"
        >
          <Container maxWidth="lg">
            <Grid
              container
              spacing={{ xs: 4, md: 6 }}
              sx={{ alignItems: "center" }}
            >
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  component="img"
                  src={shield}
                  alt=""
                  aria-hidden="true"
                  sx={{
                    width: { xs: 130, md: 170 },
                    height: "auto",
                    mb: 2,
                    filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.16))",
                  }}
                />
                <Typography
                  variant="overline"
                  sx={{ fontWeight: 700, color: accentColor }}
                >
                  {t("guardians.eyebrow")}
                </Typography>
                <Typography
                  id="guardians-title"
                  component="h2"
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    mt: 1,
                    fontSize: { xs: "1.85rem", md: "2.4rem" },
                  }}
                >
                  {t("guardians.title")}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                  {t("guardians.subtitle")}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <Stack spacing={2}>
                    {guardianPoints.map((point) => (
                      <Stack
                        key={point}
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "flex-start" }}
                      >
                        <CheckCircleIcon
                          sx={{ color: "success.main", mt: 0.25 }}
                        />
                        <Typography variant="body1">{point}</Typography>
                      </Stack>
                    ))}
                    <Button
                      variant="text"
                      href="/privacidad"
                      onClick={(event) => {
                        event.preventDefault();
                        navigate("/privacidad");
                      }}
                      sx={{ alignSelf: "flex-start", px: 0, color: accentColor }}
                    >
                      {t("guardians.cta")}
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Preguntas frecuentes */}
        <Box
          component="section"
          id="faq"
          sx={{
            py: { xs: 7, md: 10 },
            bgcolor: "background.paper",
            ...SECTION_SCROLL_MARGIN,
          }}
          aria-labelledby="faq-title"
        >
          <Container maxWidth="md">
            <Stack
              spacing={1.5}
              sx={{ alignItems: "center", textAlign: "center", mb: 5 }}
            >
              <Typography
                variant="overline"
                sx={{ fontWeight: 700, color: accentColor }}
              >
                {t("faq.eyebrow")}
              </Typography>
              <Typography
                id="faq-title"
                component="h2"
                variant="h3"
                sx={{ fontWeight: 700, fontSize: { xs: "1.85rem", md: "2.4rem" } }}
              >
                {t("faq.title")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("faq.subtitle")}
              </Typography>
            </Stack>

            {faqs.map((faq, index) => (
              <Accordion
                key={faq.question}
                elevation={0}
                disableGutters
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  mb: 1.5,
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`faq-panel-${index}`}
                  id={`faq-header-${index}`}
                >
                  <Typography sx={{ fontWeight: 600 }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Container>
        </Box>

        {/* Llamado final */}
        <Box
          component="section"
          sx={{
            py: { xs: 8, md: 11 },
            background:
              "linear-gradient(135deg, #2f4a5e 0%, #3d586c 45%, #5866ad 100%)",
            color: "common.white",
            position: "relative",
            overflow: "hidden",
          }}
          aria-labelledby="cta-title"
        >
          <Box
            component="img"
            src={shield}
            alt=""
            aria-hidden="true"
            sx={{
              position: "absolute",
              right: { xs: "-40px", md: "6%" },
              top: "50%",
              transform: "translateY(-50%) rotate(-8deg)",
              width: { xs: 220, md: 320 },
              opacity: 0.14,
            }}
          />
          <Container maxWidth="md" sx={{ position: "relative" }}>
            <Stack
              spacing={2.5}
              sx={{ alignItems: "center", textAlign: "center" }}
            >
              <Typography
                id="cta-title"
                component="h2"
                variant="h3"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2rem", md: "2.8rem" },
                  maxWidth: 700,
                }}
              >
                {t("cta.title")}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "rgba(255,255,255,0.78)", maxWidth: 600 }}
              >
                {t("cta.subtitle")}
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ pt: 1 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PersonAddIcon />}
                  href="/register"
                  onClick={(event) => {
                    event.preventDefault();
                    navigate("/register");
                  }}
                  sx={{
                    bgcolor: "common.white",
                    color: "primary.dark",
                    px: 3,
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                >
                  {t("cta.primary")}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<LoginIcon />}
                  href="/login"
                  onClick={(event) => {
                    event.preventDefault();
                    navigate("/login");
                  }}
                  sx={{
                    color: "common.white",
                    borderColor: "rgba(255,255,255,0.5)",
                    px: 3,
                    "&:hover": { borderColor: "common.white" },
                  }}
                >
                  {t("cta.secondary")}
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
