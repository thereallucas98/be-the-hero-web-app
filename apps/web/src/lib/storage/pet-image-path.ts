/**
 * Valida se storagePath segue o padrão para imagens de pet: pets/{petId}/...
 * Segue convenção do Supabase Storage (pronai-web-app).
 */
export function isValidPetImagePath(
  storagePath: string,
  petId: string,
): boolean {
  const expectedPrefix = `pets/${petId}/`
  return (
    storagePath.startsWith(expectedPrefix) &&
    storagePath.length > expectedPrefix.length
  )
}
