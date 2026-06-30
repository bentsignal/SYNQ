import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  driver: "expo",
  schema: "../../shared/db/src/schema.ts",
  out: "../../shared/db/src/migrations",
});
