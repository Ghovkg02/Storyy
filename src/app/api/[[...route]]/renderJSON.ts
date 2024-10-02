import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fabric } from "fabric";
import { Buffer } from "buffer";
import { db } from "@/db/drizzle";
import { zValidator } from "@hono/zod-validator";
import { eq, and, desc, asc, gt } from "drizzle-orm";
import { z } from "zod";
import { image, projects } from "@/db/schema";

const app = new Hono()
  .post(
    "/json",
    bodyLimit({
      maxSize: 50 * 1024, // 50kb
      onError: (c) => {
        return c.text("overflow :(", 413);
      },
    }),
    async (c) => {
      const jsonData = await c.req.json();
      const canvas = new fabric.Canvas(null);
      canvas.setWidth(832);
      canvas.setHeight(1152);
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

      await new Promise((resolve) => {
        canvas.loadFromJSON(jsonData, () => {
          canvas.renderAll();
          resolve(true);
        });
      });

      const { width, height, left, top } = canvas
        .getObjects()
        .find((object) => object.name === "clip") as fabric.Rect;

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
  )
  .get("/:id", zValidator("param", z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid("param");
    var userimage = await db.select().from(projects).where(eq(projects.id, id));
    var data = await db
      .select()
      .from(image)
      .where(
        and(
          eq(image.projectid, id),
          gt(image.createdat, userimage[0].updatedAt)
        )
      )
      .orderBy(desc(image.createdat));

    if (data.length == 0) {
      data = [
        {
          projectid: id,
          status: "",
          image: JSON.parse(userimage[0].json),
          createdat: null,
          title: null,
        },
      ];
    }

    return c.json({ data });
  });

export default app;
