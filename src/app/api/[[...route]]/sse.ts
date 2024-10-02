import { zValidator } from '@hono/zod-validator';
import { z } from "zod";
import { Hono } from 'hono';
import { streamSSE, SSEStreamingApi } from 'hono/streaming';

const app = new Hono();

export const clients: {[projectId: string]: SSEStreamingApi} = {};

app.get(
  "/:id",
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const { id } = c.req.valid("param");
    return streamSSE(c, async (stream) => {
      clients[id] = stream;
      while (true) {
        await stream.writeSSE({
          data: "keep-alive",
          event: "keep-alive"
        });
        await stream.sleep(30000);  // Wait for 30 seconds before sending the next message
      }
    })
  })

export default app;
