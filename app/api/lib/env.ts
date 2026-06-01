import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  databaseUrl: required("DATABASE_URL"),
  ownerUnionId: process.env.OWNER_UNION_ID || "",
  kimiAuthUrl: process.env.VITE_KIMI_AUTH_URL || "",
  kimiOpenUrl: process.env.VITE_KIMI_AUTH_URL || "",
  isProduction: process.env.NODE_ENV === "production",
};
