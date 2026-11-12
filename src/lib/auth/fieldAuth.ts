import { cookies } from "next/headers";
import { getFieldUser, getFieldUserByUsername, hashFieldPassword } from "@/lib/db/fieldUsersRepo";
import { FieldUser } from "@/lib/brava/field/types";

export const FIELD_COOKIE_NAME = "brava_field_token";

/** Null on a wrong username/password or a deactivated account — same message either way, never which one failed. */
export async function verifyFieldLogin(username: string, password: string): Promise<FieldUser | null> {
  const user = await getFieldUserByUsername(username);
  if (!user || !user.active) return null;
  return hashFieldPassword(password) === user.passwordHash ? user : null;
}

export function fieldCookieValue(user: FieldUser): string {
  return `${user.id}:${user.passwordHash}`;
}

/**
 * The cookie carries the user id plus their current password hash (no
 * server-side session table to manage) — reading it back means looking the
 * user up again and checking the hash still matches, so a password change
 * or a deactivation invalidates every existing cookie immediately, the same
 * way the shared editor cookie already works.
 */
export async function isRequestFieldUser(): Promise<FieldUser | null> {
  const token = cookies().get(FIELD_COOKIE_NAME)?.value;
  if (!token) return null;
  const sep = token.indexOf(":");
  if (sep < 0) return null;
  const userId = token.slice(0, sep);
  const hash = token.slice(sep + 1);
  const user = await getFieldUser(userId);
  if (!user || !user.active || user.passwordHash !== hash) return null;
  return user;
}
