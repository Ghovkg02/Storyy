import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/db/drizzle";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fabric } from "fabric";
import { Buffer } from "buffer";

const app = new Hono();
app.get(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const { id } = c.req.valid("param");

    const data = await db
      .select()
      .from(projects)
            .where(
                eq(projects.id, id)
            );

    if (data.length === 0) {
      return c.json({ error: "Not found" }, 404);
    }

    const jsonData = JSON.parse(data[0].json);

    const canvas = new fabric.Canvas(null);
    canvas.setWidth(data[0].width);
    canvas.setHeight(data[0].height);
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

    await new Promise((resolve) => {
      canvas.loadFromJSON(jsonData, () => {
                canvas.renderAll();
                resolve(true);
      });
    });

    const { width, height, left, top } = canvas.getObjects().find((object) => object.name === "clip") as fabric.Rect;

    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
      width,
      height,
      left,
      top,
    });
    const buffer = Buffer.from(dataUrl.split(",")[1], "base64");

    c.res.headers.set("Content-Type", "image/png");
    c.res.headers.set("Content-Length", buffer.length.toString());

    return c.body(buffer);
  }
);

export default app;