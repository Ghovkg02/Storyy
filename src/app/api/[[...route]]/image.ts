import { z } from "zod";
import { Hono } from "hono";
import { eq, and, desc, asc } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/db/drizzle";
import { image } from "@/db/schema";

const app = new Hono().get(
  "/:id",
  verifyAuth(),
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const auth = c.get("authUser");
    const { id } = c.req.valid("param");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const data = await db
      .select()
      .from(image)
      .where(eq(image.projectid, id))
      .orderBy(desc(image.createdat));

    if (data.length === 0) {
      return c.json({ error: "Not found" }, 404);
    }

    return c.json({ data: data });
  }
);

export default app;
