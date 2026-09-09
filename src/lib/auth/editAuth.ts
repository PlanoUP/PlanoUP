import { createHash } from "crypto";
import { cookies } from "next/headers";
import { getSetting, setSetting } from "@/lib/db/settingsRepo";

export const EDIT_COOKIE_NAME = "brava_edit_token";
export const EDIT_PASSWORD_KEY = "edit_password_hash";

/**
 * Only ever used the first time this key is read — after that the hash
 * lives in the settings table, so changing this constant later has no
 * effect on an already-seeded database.
 */
const DEFAULT_EDIT_PASSWORD = "Brava@Tanques2026";

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function getEditPasswordHash(): Promise<string> {
  const stored = await getSetting(EDIT_PASSWORD_KEY);
  if (stored) return stored;
  const hash = hashPassword(DEFAULT_EDIT_PASSWORD);
  await setSetting(EDIT_PASSWORD_KEY, hash);
  return hash;
}

/** Returns the current password hash (usable as a bearer cookie value) if it matches, else null. */
export async function verifyEditPassword(password: string): Promise<string | null> {
  const hash = await getEditPasswordHash();
  return hashPassword(password) === hash ? hash : null;
}

export async function isEditCookieValid(cookieValue: string | undefined | null): Promise<boolean> {
  if (!cookieValue) return false;
  const hash = await getEditPasswordHash();
  return cookieValue === hash;
}

/** Reads the edit cookie off the current request and checks it against the live password hash. */
export async function isRequestEditor(): Promise<boolean> {
  const token = cookies().get(EDIT_COOKIE_NAME)?.value;
  return isEditCookieValid(token);
}
