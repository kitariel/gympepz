import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // Scan the prisma/schema/ folder for *.prisma files
  schema: path.join("prisma", "schema"),
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
