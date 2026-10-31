import { defineConfig } from "drizzle-kit";

/**
 * `pnpm db:generate` writes SQL migrations to `drizzle/`, then
 * `scripts/bundle-migrations.ts` inlines them into `src/migrations.ts` so
 * neither Metro nor node needs a `.sql` loader.
 */
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/schema.ts",
  out: "./drizzle",
});
