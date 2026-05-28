import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import {
  getRefreshCookieMaxAge,
  signAccessToken,
  signRefreshToken,
} from "@/lib/security/token";

const adminRoles = ["ADMIN", "MANAGER", "STAFF"] as const;

type Portal = "client" | "admin";

export async function loginByPortal(input: {
  email: string;
  password: string;
  remember: boolean;
  portal: Portal;
}) {
  const email = input.email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password || !user.isActive) {
    return { ok: false as const, status: 401, message: "Email or password is incorrect" };
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    return { ok: false as const, status: 401, message: "Email or password is incorrect" };
  }

  const isAdminRole = adminRoles.includes(user.role as (typeof adminRoles)[number]);

  if (input.portal === "client" && user.role !== "CUSTOMER") {
    return { ok: false as const, status: 403, message: "Please login via admin portal" };
  }

  if (input.portal === "admin" && !isAdminRole) {
    return {
      ok: false as const,
      status: 403,
      message: "You are not allowed to access admin portal",
    };
  }

  const accessToken = await signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = await signRefreshToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    input.remember
  );

  return {
    ok: true as const,
    accessToken,
    refreshToken,
    refreshMaxAge: getRefreshCookieMaxAge(input.remember),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    },
  };
}
