import { useState } from 'react';
import { Box, useTheme, Typography, TextField, Button, Link, Grid, MenuItem, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogoGA } from "../components/ui/LogoGA";
import LoginIcon from '@mui/icons-material/Login';
import { CardBase } from '../components/ui/Cards/CardBase';
import { apiPrivate } from '../apis/axios';
import { contactEmergenceApi } from '../apis/contact_emergence';
import { useNavigate } from 'react-router-dom';
import { completeRegistrationSchema, type CompleteRegistrationData } from '../schemas/completeRegistration';
import useLanguage from "../hooks/useLanguage";

const defaultValues: CompleteRegistrationData = {
  peso: '',
  talla: '',
  glucosaMin: '',
  glucosaMax: '',
  nombreGuardián: '',
  parentesco: undefined,
  telefono: '',
};

export default function CompleteRegistration() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useLanguage("completeRegistration");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteRegistrationData>({
    resolver: zodResolver(completeRegistrationSchema),
    defaultValues,
  });

  const textFieldStyles = {
    mb: 2,
    '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(255,255,255,0.1)',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
    '& .MuiInputBase-input': { color: 'white' },
    '& .MuiFormHelperText-root': { color: '#ff6b6b' }
  };

  const onSubmit = async (values: CompleteRegistrationData) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const now = new Date();
      if (values.peso && values.talla) {
        await apiPrivate.post('/imc', {
          peso: Number(values.peso),
          altura: Number(values.talla),
          dia: now.getDate(),
          mes: now.getMonth() + 1,
          anio: now.getFullYear(),
        }).catch((e) => console.error('Error al crear IMC:', e));
      }

      try {
        const prefRes = await apiPrivate.get('/preference');
        const currentPrefs = prefRes.data?.data;
        if (currentPrefs) {
          await apiPrivate.post('/preference', {
            profileImg: currentPrefs.profileImg,
            unitMeasure: currentPrefs.unitMeasure,
            thresholds: {
              hypo: Number(values.glucosaMin) || currentPrefs.thresholds?.hypo,
              hiper: Number(values.glucosaMax) || currentPrefs.thresholds?.hiper,
            },
            insulinRatios: currentPrefs.insulinRatios,
            sensitivity: currentPrefs.sensitivity,
            correctionSchemas: currentPrefs.correctionSchemas ?? [],
            basalSchemas: currentPrefs.basalSchemas ?? [],
          });
        }
      } catch (e) {
        console.error('Error al actualizar preferencias:', e);
      }

      if (values.nombreGuardián) {
        await contactEmergenceApi.create({
          name: values.nombreGuardián,
          parentesco: values.parentesco || 'otro',
          telefono: values.telefono || undefined,
        });
      }

      navigate('/');
    } catch (error) {
      setAuthError(t("errorSaving"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      bgcolor: theme.palette.background.default || '#f5f5f5',
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, sm: 4 },
        justifyContent: 'center',
        alignItems: 'stretch',
        maxWidth: '1000px',
        width: '100%',
        px: { xs: 2, sm: 0 }
      }}>
        <CardBase sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 3, sm: 2 },
          '& .MuiCardContent-root': {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            height: '100%',
            padding: 0,
            '&:last-child': { pb: 0 },
          },
        }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            {t("leftTitle")}
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.primary, maxWidth: '350px', mb: 4 }}>
            {t("leftDescription")}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            {t("canSkip")}{' '}
            <Link href="/" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', textDecoration: 'none' }}>
              {t("homeLink")}
            </Link>
          </Typography>
        </CardBase>

        <CardBase sx={{
          flex: 1,
          bgcolor: theme.palette.primary.dark,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 2 },
        }}>
          <Box sx={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <LoginIcon sx={{ fontSize: 50, color: 'white', mb: 1 }} />
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
              {t("title")}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
              {t("subtitle")}
            </Typography>

            {authError && (
              <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                {authError}
              </Alert>
            )}

            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold', mb: 2, textAlign: 'left' }}>
              {t("healthTitle")}
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={6}>
                <TextField
                  {...register("peso")}
                  fullWidth
                  label={t("weightLabel")}
                  variant="outlined"
                  size="small"
                  type="number"
                  error={!!errors.peso}
                  helperText={errors.peso?.message}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  {...register("talla")}
                  fullWidth
                  label={t("heightLabel")}
                  variant="outlined"
                  size="small"
                  type="number"
                  error={!!errors.talla}
                  helperText={errors.talla?.message}
                  sx={textFieldStyles}
                />
              </Grid>
            </Grid>

            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, textAlign: 'left' }}>
              {t("glucoseRangeTitle")}
            </Typography>

            <Grid spacing={2} container sx={{ mb: 3 }}>
              <Grid size={6}>
                <TextField
                  {...register("glucosaMin")}
                  fullWidth
                  label={t("glucoseMinLabel")}
                  variant="outlined"
                  size="small"
                  type="number"
                  error={!!errors.glucosaMin}
                  helperText={errors.glucosaMin?.message}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  {...register("glucosaMax")}
                  fullWidth
                  label={t("glucoseMaxLabel")}
                  variant="outlined"
                  size="small"
                  type="number"
                  error={!!errors.glucosaMax}
                  helperText={errors.glucosaMax?.message}
                  sx={textFieldStyles}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold', mb: 2, textAlign: 'left' }}>
              {t("emergencyTitle")}
            </Typography>

            <TextField
              {...register("nombreGuardián")}
              fullWidth
              label={t("guardianNameLabel")}
              variant="outlined"
              size="small"
              error={!!errors.nombreGuardián}
              helperText={errors.nombreGuardián?.message}
              sx={textFieldStyles}
            />

            <TextField
              {...register("parentesco")}
              fullWidth
              label={t("relationshipLabel")}
              variant="outlined"
              size="small"
              select
              error={!!errors.parentesco}
              helperText={errors.parentesco?.message}
              sx={textFieldStyles}
            >
              <MenuItem value="madre">{t("relationshipMother")}</MenuItem>
              <MenuItem value="padre">{t("relationshipFather")}</MenuItem>
              <MenuItem value="hermano">{t("relationshipBrother")}</MenuItem>
              <MenuItem value="hermana">{t("relationshipSister")}</MenuItem>
              <MenuItem value="abuelo">{t("relationshipGrandfather")}</MenuItem>
              <MenuItem value="abuela">{t("relationshipGrandmother")}</MenuItem>
              <MenuItem value="tio">{t("relationshipUncle")}</MenuItem>
              <MenuItem value="tia">{t("relationshipAunt")}</MenuItem>
              <MenuItem value="tutor">{t("relationshipGuardian")}</MenuItem>
              <MenuItem value="otro">{t("relationshipOther")}</MenuItem>
            </TextField>

            <TextField
              {...register("telefono")}
              fullWidth
              label={t("phoneLabel")}
              variant="outlined"
              size="small"
              type="tel"
              sx={textFieldStyles}
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleSkip}
                disabled={isSubmitting}
                sx={{
                  py: 1,
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { borderColor: '#f5f5f5', bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                {t("skipButton")}
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                sx={{
                  py: 1,
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
              >
                {t("saveButton")}
              </Button>
            </Box>
          </Box>
        </CardBase>
      </Box>

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: { xs: 3, md: 5 },
        mb: { xs: 2, md: 0 },
        pt: 2
      }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          {t("sponsoredBy")}
        </Typography>
        <LogoGA />
      </Box>
    </Box>
  );
}
