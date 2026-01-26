import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";

const HeaderConfigSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  iconName: z.string().optional(),
  iconPlatform: z.enum(["lucide", "heroicons"]).optional(),
});

type HeaderConfig = z.infer<typeof HeaderConfigSchema>;

async function readHeaderConfig(): Promise<HeaderConfig> {
  const configPath = path.join(process.cwd(), "header-config.json");
  try {
    const raw = await fs.readFile(configPath, "utf8");
    const json: unknown = raw.trim().length ? JSON.parse(raw) : {};
    // Provide sensible defaults
    const parsed = HeaderConfigSchema.safeParse(json);
    if (!parsed.success) {
      // fall back to defaults
      return { title: "" };
    }
    return parsed.data;
  } catch (err) {
    // If file doesn't exist or is invalid, return defaults
    return { title: "" };
  }
}

async function writeHeaderConfig(config: HeaderConfig) {
  const configPath = path.join(process.cwd(), "header-config.json");
  await fs.writeFile(
    configPath,
    JSON.stringify(config, null, 2) + "\n",
    "utf8",
  );
}

export const headerRouter = createTRPCRouter({
  get: publicProcedure.query(async () => {
    const config = await readHeaderConfig();
    return config;
  }),
  update: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        subtitle: z.string().optional(),
        iconName: z.string().optional(),
        iconPlatform: z.enum(["lucide", "heroicons"]).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const config: HeaderConfig = {
        title: input.title,
        subtitle: input.subtitle?.trim() ?? undefined,
        iconName: input.iconName?.trim() ?? undefined,
        iconPlatform: input.iconPlatform,
      };
      await writeHeaderConfig(config);
      return { ok: true };
    }),
});
