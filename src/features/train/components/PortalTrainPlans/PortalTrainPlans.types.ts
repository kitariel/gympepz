import type { CustomProgramRecord } from "@/lib/storage/customProgramsRepo";

export type PortalTrainPlansViewProps = {
  hydrated: boolean;
  items: CustomProgramRecord[];
  createHref: string;
  backHref: string;
  getEditHref: (id: string) => string;
  onUse: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
};
