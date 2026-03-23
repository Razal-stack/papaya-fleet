import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@papaya-fleet/api/context";
import { appRouter } from "@papaya-fleet/api/routers/index";
import { auth } from "@papaya-fleet/auth";
import { env } from "@papaya-fleet/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});

app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "papaya-fleet-api",
  });
});

const port = Number(process.env.PORT) || 3101;
console.log(`🚀 Server starting on port ${port}...`);

export default {
  port,
  fetch: app.fetch,
};
