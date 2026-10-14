import { neon, NeonQueryFunction } from "@neondatabase/serverless";

// Vercel's Postgres (Neon) storage integration injects several equivalent
// connection strings — accept whichever is present so this works regardless
// of which one the dashboard named for this project.
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING;

export function isDatabaseConfigured(): boolean {
  return Boolean(connectionString);
}

let client: NeonQueryFunction<false, false> | null = null;

/** Lazy accessor — only throws when a query actually runs without a database attached, never at import/build time. */
export function getSql(): NeonQueryFunction<false, false> {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não configurada — conecte um banco Postgres ao projeto na Vercel (Storage → Create Database)."
    );
  }
  // Next.js's App Router patches the global fetch() to cache/memoize by
  // default, and the Neon HTTP driver sends every query as a fetch() under
  // the hood — an identical SELECT (same SQL text, no params, like
  // "SELECT data FROM tanks") was being served a stale cached response
  // indefinitely instead of re-querying the database. force-dynamic on the
  // route alone wasn't enough to stop this from happening to fetches made
  // deeper inside the call stack. cache: "no-store" opts every query out.
  if (!client) client = neon(connectionString, { fetchOptions: { cache: "no-store" } });
  return client;
}
