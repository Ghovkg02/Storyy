import { z } from "zod";
import { Hono } from "hono";
import { eq, and, desc, asc } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/db/drizzle";
import { narratives } from "@/db/schema";

const app = new Hono()
.get(
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
      .from(narratives)
      .where(
          eq(narratives.projectId, id)
      );

    if (data.length === 0) {
      return c.json({ error: "Not found" }, 404);
    }

    return c.json({ data: data[0] });
  },
)
.patch(
    "/:id",
    verifyAuth(),
    zValidator(
      "param",
      z.object({ id: z.string() }),
    ),
    zValidator(
        "json",
        z.object({
          narrative_0: z.string(),
          narrative_1: z.string(),
          narrative_2: z.string(),
          narrative_3: z.string()
        })
      ),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .update(narratives)
        .set({
            ...values,
        })
        .where(
            // and(
            // eq(narratives.projectId, id)
            // db.ref('projects.userId').eq(auth.token.id) // Subquery or condition for userId
            // )
            eq(narratives.projectId, id)
        )
        .returning();

      if (data.length === 0) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      return c.json({ data: data[0] });
    },
  )
  .post(
    "/",
    verifyAuth(),
    zValidator(
        "json",
        z.object({
          projectId: z.string(),
          narrative_0: z.string(),
          narrative_1: z.string(),
          narrative_2: z.string(),
          narrative_3: z.string()
        })
      ),
    async (c) => {
      const auth = c.get("authUser");
      const values = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .insert(narratives)
        .values(values)
        .returning();

      if (!data[0]) {
        return c.json({ error: "Something went wrong" }, 400);
      }

      return c.json({ data: data[0] });
    },
  );

export default app;