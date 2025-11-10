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
        order: z.number().optional(),
        // Optional icon name per parent item
        iconName: z.string().optional(),
        // Optional icon platform per parent item
        iconPlatform: z.enum(["lucide", "heroicons"]).optional(),
        // Optional enabled flag to control visibility for non-admin views
        enabled: z.boolean().optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              url: z.string(),
              order: z.number().optional(),
              // Optional enabled flag to control visibility for non-admin views
              enabled: z.boolean().optional(),
            }),
          )
          .optional(),
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
        iconName: z.string().optional(),
        iconPlatform: z.enum(["lucide", "heroicons"]).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const config = await readConfig();
      const newItem = {
        title: input.label,
        url: "#",
        isActive: false,
        order: config.navMain.length,
        items: input.type === "group" ? [] : undefined,
        iconName: input.iconName?.trim() ?? undefined,
        iconPlatform: input.iconPlatform ?? (input.iconName ? "lucide" : undefined),
        enabled: true,
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
      const newChild = { title: input.child.title, url: input.child.url, order: parent.items.length, enabled: true };
      parent.items.push(newChild);
      await writeConfig(config);
      return { ok: true };
    }),
  updateParentLabel: publicProcedure
    .input(z.object({ oldTitle: z.string().min(1), newTitle: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const config = await readConfig();
      const parent = config.navMain.find((i) => i.title === input.oldTitle);
      if (!parent) throw new Error(`Parent item not found: ${input.oldTitle}`);
      parent.title = input.newTitle;
      await writeConfig(config);
      return { ok: true };
    }),
  updateChildLabel: publicProcedure
    .input(
      z.object({
        parentTitle: z.string().min(1),
        oldTitle: z.string().min(1),
        newTitle: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const config = await readConfig();
      const parent = config.navMain.find((i) => i.title === input.parentTitle);
      if (!parent) throw new Error(`Parent item not found: ${input.parentTitle}`);
      const child = parent.items?.find((c) => c.title === input.oldTitle);
      if (!child) throw new Error(`Child item not found: ${input.oldTitle}`);
      child.title = input.newTitle;
      await writeConfig(config);
      return { ok: true };
    }),
  reorderNavMain: publicProcedure
    .input(z.object({ orderedTitles: z.array(z.string().min(1)).min(1) }))
    .mutation(async ({ input }) => {
      const config = await readConfig();
      const titleSet = new Set(input.orderedTitles);
      // Filter to only existing items, then sort by order specified
      const existing = config.navMain.filter((i) => titleSet.has(i.title));
      existing.sort(
        (a, b) => input.orderedTitles.indexOf(a.title) - input.orderedTitles.indexOf(b.title),
      );
      // Update order field based on new index
      existing.forEach((item, idx) => (item.order = idx));
      // Keep non-mentioned items after existing order
      const rest = config.navMain.filter((i) => !titleSet.has(i.title));
      config.navMain = [...existing, ...rest];
      await writeConfig(config);
      return { ok: true };
    }),
  reorderChildren: publicProcedure
    .input(
      z.object({ parentTitle: z.string().min(1), orderedTitles: z.array(z.string().min(1)).min(1) }),
    )
    .mutation(async ({ input }) => {
      const config = await readConfig();
      const parent = config.navMain.find((i) => i.title === input.parentTitle);
      if (!parent) throw new Error(`Parent item not found: ${input.parentTitle}`);
      const titleSet = new Set(input.orderedTitles);
      const children = (parent.items ?? []).filter((c) => titleSet.has(c.title));
      children.sort(
        (a, b) => input.orderedTitles.indexOf(a.title) - input.orderedTitles.indexOf(b.title),
      );
      children.forEach((c, idx) => (c.order = idx));
      const rest = (parent.items ?? []).filter((c) => !titleSet.has(c.title));
      parent.items = [...children, ...rest];
      await writeConfig(config);
      return { ok: true };
    }),
  updateParentIcon: publicProcedure
    .input(z.object({ title: z.string().min(1), iconName: z.string().optional(), iconPlatform: z.enum(["lucide", "heroicons"]).optional() }))
    .mutation(async ({ input }) => {
      const config = await readConfig();
      const parent = config.navMain.find((i) => i.title === input.title);
      if (!parent) throw new Error(`Parent item not found: ${input.title}`);
      const trimmed = input.iconName?.trim();
      if (trimmed) {
        parent.iconName = trimmed;
        parent.iconPlatform = input.iconPlatform ?? parent.iconPlatform ?? "lucide";
      } else {
        // Clear icon by setting undefined (will be omitted in JSON)
        parent.iconName = undefined;
        parent.iconPlatform = undefined;
      }
      await writeConfig(config);
      return { ok: true };
    }),
  deleteParent: publicProcedure
    .input(z.object({ title: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const config = await readConfig();
      const idx = config.navMain.findIndex((i) => i.title === input.title);
      if (idx === -1) throw new Error(`Parent item not found: ${input.title}`);
      config.navMain.splice(idx, 1);
      await writeConfig(config);
      return { ok: true };
    }),
  deleteChild: publicProcedure
    .input(z.object({ parentTitle: z.string().min(1), childTitle: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const config = await readConfig();
      const parent = config.navMain.find((i) => i.title === input.parentTitle);
      if (!parent) throw new Error(`Parent item not found: ${input.parentTitle}`);
      const idx = (parent.items ?? []).findIndex((c) => c.title === input.childTitle);
      if (idx === -1) throw new Error(`Child item not found: ${input.childTitle}`);
      parent.items!.splice(idx, 1);
      await writeConfig(config);
      return { ok: true };
    }),
});
