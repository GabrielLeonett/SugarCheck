import { useTranslation } from "react-i18next";
import { LegalLayout, LegalSections } from "./LegalLayout";
import type { LegalPageContent } from "./types";

export default function PrivacyPolicy() {
  const { t } = useTranslation("legal");
  const content = t("privacy", { returnObjects: true }) as unknown as LegalPageContent;

  return (
    <LegalLayout content={content}>
      <LegalSections sections={content.sections} />
    </LegalLayout>
  );
}
