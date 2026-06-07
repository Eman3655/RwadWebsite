import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { serveStatic } from "@hono/node-server/serve-static";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import path from "path";
import fs from "fs/promises";
import { v2 as cloudinary } from "cloudinary";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error("Missing Cloudinary environment variables:", {
    CLOUDINARY_CLOUD_NAME: Boolean(cloudName),
    CLOUDINARY_API_KEY: Boolean(apiKey),
    CLOUDINARY_API_SECRET: Boolean(apiSecret),
  });
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

app.post("/api/upload/course-image", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["image"];

    if (!(file instanceof File)) {
      return c.json({ message: "No file uploaded" }, 400);
    }

    if (!file.type.startsWith("image/")) {
      return c.json({ message: "Only images are allowed" }, 400);
    }

    if (!cloudName || !apiKey || !apiSecret) {
      return c.json(
        {
          message:
            "Cloudinary is not configured. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
        },
        500,
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "alrowad/courses",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    return c.json({
      url: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Course image upload failed:", error);

    return c.json(
      {
        message: "Course image upload failed",
      },
      500,
    );
  }
});

app.use("/uploads/*", serveStatic({ root: "./" }));

app.post("/api/upload/avatar", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["avatar"];

    if (!(file instanceof File)) {
      return c.json({ message: "No file uploaded" }, 400);
    }

    if (!file.type.startsWith("image/")) {
      return c.json({ message: "Only images are allowed" }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "alrowad/avatars",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    return c.json({
      url: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Avatar upload failed:", error);

    return c.json(
      {
        message: "Avatar upload failed",
      },
      500,
    );
  }
});

// OAuth callback route
app.get("/api/oauth/callback", createOAuthCallbackHandler());

// tRPC API
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction && !process.env.VERCEL) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");

  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");

  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}