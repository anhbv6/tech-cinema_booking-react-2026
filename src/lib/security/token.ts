import { jwtVerify, SignJWT } from "jose";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "1d";
const REFRESH_TOKEN_TTL_REMEMBER = "30d";

export type AppRole = "ADMIN" | "MANAGER" | "STAFF" | "CUSTOMER";

export type TokenPayload = {
  sub: string;
  email: string;
  role: AppRole;
  type: "access" | "refresh";
};

function getSecret(key: "ACCESS_TOKEN_SECRET" | "REFRESH_TOKEN_SECRET") {
  const value = process.env[key] || process.env.NEXTAUTH_SECRET;

  if (!value) {
    throw new Error(`${key} is not configured`);
  }

  return new TextEncoder().encode(value);
}

export async function signAccessToken(user: {
  id: string;
  email: string;
  role: AppRole;
}) {
  return new SignJWT({
    email: user.email,
    role: user.role,
    type: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(getSecret("ACCESS_TOKEN_SECRET"));
}

export async function signRefreshToken(
  user: {
    id: string;
    email: string;
    role: AppRole;
  },
  remember: boolean
) {
  return new SignJWT({
    email: user.email,
    role: user.role,
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(remember ? REFRESH_TOKEN_TTL_REMEMBER : REFRESH_TOKEN_TTL)
    .sign(getSecret("REFRESH_TOKEN_SECRET"));
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret("ACCESS_TOKEN_SECRET"));

  if (payload.type !== "access") {
    throw new Error("Invalid token type");
  }

  return payload as unknown as TokenPayload;
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret("REFRESH_TOKEN_SECRET"));

  if (payload.type !== "refresh") {
    throw new Error("Invalid token type");
  }

  return payload as unknown as TokenPayload;
}

export function getRefreshCookieMaxAge(remember: boolean) {
  return remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
}
