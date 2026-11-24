import {
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CookieIcon from "@mui/icons-material/Cookie";
import { useTranslation } from "react-i18next";
import { LegalLayout, LegalSections } from "./LegalLayout";
import { openCookiePreferences } from "../../utils/cookieConsent";
import type { CookieTableContent, LegalPageContent } from "./types";

export default function CookiePolicy() {
  const { t } = useTranslation("legal");
  const content = t("cookies", { returnObjects: true }) as unknown as LegalPageContent;
  const table = t("cookies.storageTable", { returnObjects: true }) as unknown as CookieTableContent;

  return (
    <LegalLayout content={content}>
      <Stack spacing={3}>
        <Button
          variant="outlined"
          startIcon={<CookieIcon />}
          onClick={openCookiePreferences}
          sx={{ alignSelf: "flex-start" }}
        >
          {t("managePreferences")}
        </Button>

        <Typography variant="h6" component="h2" sx={{ color: "primary.main" }}>
          {t("cookies.tableTitle")}
        </Typography>

        <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
          <Table size="small" aria-label={t("cookies.tableTitle")}>
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                {table.headers.map((header) => (
                  <TableCell key={header} sx={{ fontWeight: 600 }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {table.rows.map((row) => (
                <TableRow key={row.name}>
                  <TableCell component="th" scope="row" sx={{ fontFamily: "monospace", whiteSpace: "nowrap" }}>
                    {row.name}
                  </TableCell>
                  <TableCell>{row.purpose}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{row.duration}</TableCell>
                  <TableCell>{row.type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <LegalSections sections={content.sections} />
      </Stack>
    </LegalLayout>
  );
}
