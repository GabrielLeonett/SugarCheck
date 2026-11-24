export interface LegalSectionContent {
  title: string;
  paragraphs: string[];
}

export interface LegalPageContent {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSectionContent[];
}

export interface CookieStorageRow {
  name: string;
  purpose: string;
  duration: string;
  type: string;
}

export interface CookieTableContent {
  headers: string[];
  rows: CookieStorageRow[];
}
