import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface UserSession {
  id: number;
  username: string;
  email: string;
  role: string;
  customTitle: string | null;
  badgeColor: string | null;
  avatarUrl: string | null;
  isBanned: boolean;
}

const COOKIE_NAME = "ender_forum_session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function setSessionCookie(user: { id: number; username: string }) {
  const cookieStore = await cookies();
  const sessionData = JSON.stringify({
    userId: user.id,
    username: user.username,
    loginAt: Date.now(),
  });

  cookieStore.set(COOKIE_NAME, Buffer.from(sessionData).toString("base64"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString("utf-8"));
    if (!decoded || !decoded.userId) return null;

    const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      customTitle: user.customTitle,
      badgeColor: user.badgeColor,
      avatarUrl: user.avatarUrl,
      isBanned: user.isBanned,
    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

export function isStaffRole(role: string): boolean {
  return ["owner", "ga", "zga", "admin", "curator"].includes(role);
}

export function isOwner(role: string): boolean {
  return role === "owner";
}
