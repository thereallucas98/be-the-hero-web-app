# Integração Supabase Storage (pet images)

O padrão de storage segue a implementação em `~/tmp/puzzles/pronai-web-app`.

## Configuração

1. Instalar: `pnpm --filter web add @supabase/supabase-js`
2. Variáveis de ambiente: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
3. Bucket: `bethehero-pet-images`
4. Path das imagens: `pets/{petId}/{filename}`

## Criar `lib/storage/supabase.ts`

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const PET_IMAGES_BUCKET = 'bethehero-pet-images'

export function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase env')
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })
}

export async function uploadPetImage(petId: string, file: Buffer | Blob, filename: string, contentType: string) {
  const supabase = getSupabaseAdmin()
  const path = `pets/${petId}/${filename}`
  const { data, error } = await supabase.storage.from(PET_IMAGES_BUCKET).upload(path, file, {
    contentType,
    upsert: true,
  })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  const { data: signed } = await supabase.storage.from(PET_IMAGES_BUCKET).createSignedUrl(path, 3600)
  return { path, url: signed?.signedUrl ?? '' }
}
```

## Fluxo add image

1. Cliente faz upload para Supabase Storage (SDK ou signed upload URL)
2. Cliente chama `POST /api/pets/:id/images` com `{ url, storagePath, position, isCover }`
3. storagePath deve seguir `pets/{petId}/...`
