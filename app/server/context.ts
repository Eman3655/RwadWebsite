import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { authenticateRequest } from "./kimi/auth";
import type { SelectUser } from "@db/schema";
import * as cookie from "cookie";
import { verifyLocalToken } from "./auth-router";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: SelectUser;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  try {
    const cookies = cookie.parse(opts.req.headers.get("cookie") || "");

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

        const user = rows.at(0);
        if (user) {
          return { req: opts.req, resHeaders: opts.resHeaders, user };
        }
      }
    }

    const user = await authenticateRequest(opts.req.headers);
    return { req: opts.req, resHeaders: opts.resHeaders, user };
  } catch {
    return { req: opts.req, resHeaders: opts.resHeaders };
  }
}