import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

const MenuConfigSchema = z.object({
  navMain: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().default("#"),
        isActive: z.boolean().optional(),
        items: z.array(z.object({ title: z.string(), url: z.string() })).optional(),
      }),
    )
    .default([]),
  navSecondary: z
    .array(z.object({ title: z.string(), url: z.string().default("#") }))
    .default([]),
  projects: z
    .array(z.object({ name: z.string(), url: z.string().default("#") }))
    .default([]),
});

type MenuConfig = z.infer<typeof MenuConfigSchema>;

async function readConfig(): Promise<MenuConfig> {
  const configPath = path.join(process.cwd(), "menu-config.json");
  try {
    const raw = await fs.readFile(configPath, "utf8");
    const json: unknown = raw.trim().length ? JSON.parse(raw) : {};
    return MenuConfigSchema.parse(json);
  } catch (err) {
    // If file doesn't exist or is invalid, return defaults
    return MenuConfigSchema.parse({});
  }
}

async function writeConfig(config: MenuConfig) {
  const configPath = path.join(process.cwd(), "menu-config.json");
  await fs.writeFile(configPath, JSON.stringify(config, null, 2) + "\n", "utf8");
}

export const menuRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const config = await readConfig();
    return config;
  }),
  create: publicProcedure
    .input(
      z.object({
        label: z.string().min(1),
        type: z.enum(["group", "single"]).default("single"),
      }),
    )
    .mutation(async ({ input }) => {
      const config = await readConfig();
      const newItem = {
        title: input.label,
        url: "#",
        isActive: false,
        items: input.type === "group" ? [] : undefined,
      };
      config.navMain.push(newItem);
      await writeConfig(config);
      return { ok: true };
    }),
  createChild: publicProcedure
    .input(
      z.object({
        parentTitle: z.string().min(1),
        child: z.object({
          title: z.string().min(1),
          url: z.string().default("#"),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const config = await readConfig();
      const parent = config.navMain.find((i) => i.title === input.parentTitle);
      if (!parent) {
        throw new Error(`Parent item not found: ${input.parentTitle}`);
      }
      parent.items ??= [];
      parent.items.push({ title: input.child.title, url: input.child.url });
      await writeConfig(config);
      return { ok: true };
    }),
});
