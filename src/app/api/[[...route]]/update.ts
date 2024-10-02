import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { Hono } from "hono";
import { clients } from "./sse";

const app = new Hono().post(
  "/",
  zValidator(
    "json",
    z.object({
      projectId: z.string(),
      title: z.string(),
      status: z.string(),
      image: z.any(),
    })
  ),
  async (c) => {
    const { projectId, title, status, image } = c.req.valid("json");
    const client = clients[projectId];
    if (client)
      await client.writeSSE({
        data: JSON.stringify({ title: title, status: status, image: image }),
        event: "update",
      });

    return c.json({ message: "Done" });
  }
);

export default app;
