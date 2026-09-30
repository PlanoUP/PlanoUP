/**
 * Monta a URL de uma foto do Unsplash com parâmetros de otimização.
 * Quando migrarmos para o Supabase Storage, basta trocar esta função.
 */
export function unsplash(photoId: string, width = 1200, quality = 75): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=${quality}`
}
