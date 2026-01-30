import type { TemplateCardVM } from "../TemplateCard/TemplateCard.types";

export type TemplateListViewProps =
  | { kind: "loading" }
  | {
      kind: "offlineEmpty";
      backHref: string;
      title: string;
      message: string;
    }
  | {
      kind: "noProfile";
      onboardingHref: string;
      backHref: string;
    }
  | {
      kind: "ready";
      editPrefsHref: string;
      editPrefsLabel: string;
      backHref: string;
      recommendedTitle: string;
      recommendedCards: TemplateCardVM[];
      allCards: TemplateCardVM[];
      offlineNotice?: string;
    };
