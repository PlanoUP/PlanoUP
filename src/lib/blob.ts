/** Mirrors isDatabaseConfigured() — true once a Blob store is connected to this project (Vercel sets BLOB_READ_WRITE_TOKEN automatically). */
export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
