import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { v2 as cloudinary } from "cloudinary";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

const cloudName = env.cloudinaryCloudName;
const apiKey = env.cloudinaryApiKey;
const apiSecret = env.cloudinaryApiSecret;

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

async function uploadImageToCloudinary(file: File, folder: string) {
  if (!(file instanceof File)) {
    throw new Error("No file uploaded");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only images are allowed");
  }

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadResult = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      )
      .end(buffer);
  });

  return uploadResult.secure_url as string;
}

app.post("/api/upload/course-image", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["image"];

    if (!(file instanceof File)) {
      return c.json({ message: "No file uploaded" }, 400);
    }

    const url = await uploadImageToCloudinary(file, "alrowad/courses");

    return c.json({ url });
  } catch (error) {
    console.error("Course image upload failed:", error);

    return c.json(
      {
        message:
          error instanceof Error ? error.message : "Course image upload failed",
      },
      500,
    );
  }
});



app.post("/api/upload/avatar", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["avatar"];

    if (!(file instanceof File)) {
      return c.json({ message: "No file uploaded" }, 400);
    }

    const url = await uploadImageToCloudinary(file, "alrowad/avatars");

    return c.json({ url });
  } catch (error) {
    console.error("Avatar upload failed:", error);

    return c.json(
      {
        message: error instanceof Error ? error.message : "Avatar upload failed",
      },
      500,
    );
  }
});


async function uploadFileToCloudinary(file: File, folder: string) {
  if (!(file instanceof File)) {
    throw new Error("No file uploaded");
  }

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadResult = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "auto",
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      )
      .end(buffer);
  });

  return {
    url: uploadResult.secure_url as string,
    fileType: file.type || uploadResult.resource_type,
    fileSize: file.size,
  };
}

app.post("/api/upload/course-attachment", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];

    if (!(file instanceof File)) {
      return c.json({ message: "No file uploaded" }, 400);
    }

    const result = await uploadFileToCloudinary(file, "alrowad/attachments");

    return c.json(result);
  } catch (error) {
    console.error("Course attachment upload failed:", error);

    return c.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Course attachment upload failed",
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