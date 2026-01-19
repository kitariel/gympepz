export type TrainEntryLinkCta = {
  label: string;
  href: string;
  variant?: "default" | "outline" | "ghost";
};

export type TrainEntryStartCard =
  | { kind: "loading" }
  | { kind: "draft"; cta: TrainEntryLinkCta }
  | {
      kind: "program";
      primary: TrainEntryLinkCta;
      secondary: TrainEntryLinkCta;
      programName: string;
    }
  | { kind: "profile"; cta: TrainEntryLinkCta }
  | { kind: "new"; primary: TrainEntryLinkCta; secondary: TrainEntryLinkCta };

export type TrainEntryScreenViewProps = {
  statusText: string;
  sessionsText: string;
  startCard: TrainEntryStartCard;
  historyHref: string;
  templatesHref: string;
  buildHref: string;
  plansHref: string;
};
