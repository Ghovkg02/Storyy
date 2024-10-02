import { Context, Hono } from "hono";
import { handle } from "hono/vercel";
import { AuthConfig, initAuthConfig } from "@hono/auth-js";

import ai from "./ai";
import users from "./users";
import images from "./images";
import projects from "./projects";
import narratives from "./narratives";
import subscriptions from "./subscriptions";
import render from "./render";
import renderJSON from "./renderJSON";
import sse from "./sse";
import update from "./update";
import image from "./image";
import authConfig from "@/auth.config";

// Revert to "edge" if planning on running on the edge
export const runtime = "nodejs";

function getAuthConfig(c: Context): AuthConfig {
  return {
    secret: c.env.AUTH_SECRET,
    ...authConfig,
  };
}

const app = new Hono().basePath("/api");

app.use("*", initAuthConfig(getAuthConfig));

const routes = app
  .route("/ai", ai)
  .route("/users", users)
  .route("/images", images)
  .route("/projects", projects)
  .route("/narratives", narratives)
  .route("/render", render)
  .route("/subscriptions", subscriptions)
  .route("/sse", sse)
  .route("/update", update)
  .route("/image", image)
  .route("/renderJSON", renderJSON);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
