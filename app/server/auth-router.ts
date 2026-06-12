import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "../server/lib/cookies";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { z } from "zod";
import { getDb } from "../server/queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import * as jose from "jose";
import { env } from "../server/lib/env";
import bcrypt from "bcryptjs";

const JWT_ALG = "HS256";

async function signLocalToken(payload: {
  userId: number;
  email: string;
}): Promise<string> {
  const secret = new TextEncoder().encode(env.appSecret);

  return new jose.SignJWT(payload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyLocalToken(token: string) {
  try {
    const secret = new TextEncoder().encode(env.appSecret);

    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
      clockTolerance: 60,
    });

    return payload as unknown as {
      userId: number;
      email: string;
    };
  } catch {
    return null;
  }
}

export const authRouter = createRouter({
  me: publicQuery.query(async ({ ctx }) => {
    if (ctx.user) {
      return ctx.user;
    }

    const cookies = cookie.parse(ctx.req.headers.get("cookie") || "");
    const localToken = cookies["local_auth_token"];

    if (localToken) {
      const claim = await verifyLocalToken(localToken);

      if (claim) {
        const db = getDb();

        const rows = await db
          .select()
          .from(users)
          .where(eq(users.id, claim.userId))
          .limit(1);

        return rows.at(0) ?? null;
      }
    }

    return null;
  }),

  updateProfile: authedQuery
    .input(
      z.object({
        name: z.string().min(2, "الاسم قصير جدًا"),
        avatar: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [updatedUser] = await db
        .update(users)
        .set({
          name: input.name.trim(),
          avatar: input.avatar?.trim() || null,
        })
        .where(eq(users.id, ctx.user.id))
        .returning();

      return updatedUser ?? null;
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    const cookies: string[] = [];

    cookies.push(
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );

    cookies.push(
      cookie.serialize("local_auth_token", "", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 0,
      }),
    );

    cookies.forEach((c) => ctx.resHeaders.append("set-cookie", c));

    return { success: true };
  }),

  localLogin: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const rows = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      const user = rows.at(0);

      if (!user || !user.password) {
        throw new Error("Invalid email or password");
      }

      const isValid = await bcrypt.compare(input.password, user.password);

      if (!isValid) {
        throw new Error("Invalid email or password");
      }

      await db
        .update(users)
        .set({ lastSignInAt: new Date() })
        .where(eq(users.id, user.id));

      const token = await signLocalToken({
        userId: user.id,
        email: user.email,
      });

      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize("local_auth_token", token, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
        }),
      );

      return { user, token };
    }),

  localRegister: publicQuery
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["student", "teacher"]).optional().default("student"),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        throw new Error("Email already registered");
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const [createdUser] = await db
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: input.role,
          isActive: true,
        })
        .returning({ id: users.id });

      return {
        success: true,
        userId: createdUser.id,
      };
    }),
});