import { db } from "@synq/db";
import * as schema from "@synq/db/schema";
import { eq } from "drizzle-orm";

export const hasStoredImageHash = async (hash: string) => {
  const existingRows = await db
    .select({ hash: schema.images.hash })
    .from(schema.images)
    .where(eq(schema.images.hash, hash))
    .limit(1);

  return existingRows.length > 0;
};

export const insertStoredImageHash = async (hash: string) => {
  await db.insert(schema.images).values({ hash });
};
