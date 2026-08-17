export type GenerationRow = {
  id: string;
  prompt: string;
  mode: "mobile" | "web" | "system";
  style: string;
  unlocked: boolean;
  created_at: string;
  favorite: boolean;
  parentId: string | null;
  variationGroup: string | null;
  url: string | null;
};
